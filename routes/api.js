var express = require('express');
var router = express.Router();
var cache = require('../modules/cache.js');

router.get('/rooms', function(req, res, next) {
    res.json(cache.get('rooms'));
});

// get a user if they exist and password is correct
router.get('/user', function(req, res, next) {
    var users = cache.get('users');
    var userFound = false;
    for (var i = 0; i < users.length; i++) {
        if (req.query.user === users[i].name) {
            userFound = true;
            console.log(users[i].name+"|"+req.query.pwd+"|"+users[i].pwd);
            if (req.query.pwd === users[i].pwd) {
                if (cache.get('socket'))
                    cache.get('socket').broadcast.emit('user.joined',users[i].name);
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
        var obj = {
            name: req.query.user,
            pwd: '',
            access: 'user'
        }
        cache.values['users'].push(obj);
        res.json({exists:true,setpwd:true});
    } else if (!userFound) {
        res.json({exists:false});
    }
});

// set a users password if not already set
router.post('/user', function(req, res, next) {
    var found = -1;
    var username = req.query.user;
    for (var i = 0; i < cache.values['users'].length; i++) {
        if (username === cache.values['users'][i].name && cache.values['users'][i].pwd === '') {   
            cache.values['users'][i].pwd = req.query.pwd;
            found = i;
            break;
        }
    }
    if (found >= 0) {
        if (cache.get('socket'))
            cache.get('socket').broadcast.emit('user.joined',username);
        res.json({exists:true,login:true,access:cache.values['users'][found].access});
    } else {
        res.json({error:'access denied'});
    }
});

module.exports = router;
