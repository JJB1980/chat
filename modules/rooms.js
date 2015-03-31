var cache = require('../modules/cache.js');
var data = require('../modules/data.js');

var obj = {};

cache.set('room.users', []);

obj.addUser = function (room,user) {
    var ru = cache.get('room.users');
    if (!ru[room]) {
        ru[room] = [];
    }
    ru[room].push(user);
    cache.set('room.users',ru)    
};

obj.removeUser = function (room,user) {
    var ru = cache.get('room.users');
    if (!ru[room]) {
        ru[room] = [];
    }
    ru[room].splice(ru[room].indexOf(user),1);
    cache.set('room.users',ru)
};

obj.userList = function (room) {
    var ru = cache.get('room.users');
    return ru[room] || [] ;
};

module.exports = obj;
