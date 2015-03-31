var express = require('express');
var router = express.Router();
var cache = require('../modules/cache.js');

// get rooms
router.get('/rooms', function(req, res, next) {
    res.json({data: cache.get('rooms')});
});

// get a user if they exist and password is correct
router.get('/user', function(req, res, next) {
    var users = cache.get('users');
    var userFound = false;
    for (var i = 0; i < users.length; i++) {
        if (req.query.user === users[i].name) {
            userFound = true;
//            console.log(users[i].name+"|"+req.query.pwd+"|"+users[i].pwd);
            if (req.query.pwd === users[i].pwd) {
                 res.json({exists:true,login:true,access:users[i].access});
            } else if (users[i].pwd === '') {
                res.json({exists:true,setpwd:true});
            } else {
                res.json({exists:true,login:false});
            }
            break;
        }
    }
    if (!userFound && req.query.user !== '') {
        res.json({exists:false,setpwd:true});
    } else if (!userFound) {
        res.json({exists:false});
    }
});

// set a user &/or password if not already set
router.post('/user', function(req, res, next) {
    var found = -1;
    var username = req.query.user;
    var token = req.query.pwd;
    if (!username || !token) {
        res.json({error:'access denied'});
        return;
    }
    var obj = {
        name: username,
        pwd: token,
        access: 'user'
    }
    cache.values['users'].push(obj);
    if (cache.get('socket')) {
        cache.get('socket').broadcast.emit('user.joined',username);
    }
    res.json({exists:true,login:true,access:obj.access});
 });

module.exports = router;
