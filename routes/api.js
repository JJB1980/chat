var express = require('express');
var router = express.Router();
var cache = require('../modules/cache.js');

/* GET home page. */
router.get('/user', function(req, res, next) {
    console.log(req.params);
    var users = cache.get('users');
    var userFound = false;
    users.forEach(function (user) {
        if (req.params.user === user.name) {
            userFound = true;
            if (req.params.pwd === user.pwd) {
                res.json({exists:true,login:true,access:user.access});
            } else if (user.pwd === '') {
                res.json({exists:true,setpwd:true});
            } else {
                res.json({exists:true,login:false});
            }
        }
    });
    if (!userFound) {
        var obj = {
            name: req.params.user,
            pwd: '',
            access: 'user'
        }
        cache.values['users'].push(obj);
        res.json({exists:true,setpwd:true});
    }
});

router.post('/user', function(req, res, next) {
    var i;
    for (i = 0; i < cache.values['users'].length; i++) {
        if (req.params.user === user.name) {   
            cache.values['users'][i].pwd = req.params.pwd;
            break;
        }
    }
    res.json({exists:true,login:true,access:cache.values['users'][i].access});
});

module.exports = router;
