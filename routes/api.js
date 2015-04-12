var express = require('express');
var router = express.Router();
var rooms = require('../modules/rooms.js');
var utils = require('../modules/utils.js');
var _users = require('../modules/users.js');

// get rooms
router.get('/rooms', function(req, res, next) {
    res.json({data: rooms.getRooms()});
});

// get a user if they exist and password is correct
router.get('/user', function(req, res, next) {
    var user = _users.getUser(req.query.user);
    if (user) {
//            console.log(users[i].name+"|"+req.query.pwd+"|"+users[i].pwd);
        if ((req.query.pwd === user.pwd) || (req.query.token === user.token)) {
            var token = utils.uuid();
            _users.updateToken(user.name,token);
            res.json({
                exists: true,
                login: true,
                access: user.access,
                token: token
            });
        } else if (user.pwd === '') {
            res.json({exists:true,setpwd:true});
        } else {
            res.json({exists:true,login:false});
        }
    } else if (!user && req.query.user !== '') {
        res.json({exists:false,setpwd:true});
    } else {
        res.json({exists:false});
    }
});

// register a user
router.post('/user', function(req, res, next) {
    var found = -1;
    var username = req.query.user;
    var pwd = req.query.pwd;
    if (!utils.ok(username) || !utils.ok(pwd)) {
        res.json({error:'missing username or password'});
        return;
    }
    var token = utils.uuid();
    _users.addUser(username,pwd,token);
    res.json({
        exists: true,
        login: true,
        access: 'user',
        token: token
    });
 });

module.exports = router;
