var cache = require('../modules/cache.js');
var data = require('../modules/data.js');

var obj = {};

obj.access = function (user) {
    var users = cache.get('users');
    users.forEach(function (user) {
        if (user.name === user) {
            return user.access;
        }
    });
}

data.read('users.dat').then(function (data) {
    cache.set('users',data.data || []);
    console.log(data);
}, function (err) {
    console.log(err);
    cache.set('users',[]);
});

module.exports = obj;
