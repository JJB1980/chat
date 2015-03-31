var cache = require('../modules/cache.js');
var data = require('../modules/data.js');

var obj = {};

cache.set('room.users', []);

// add user to room
obj.addUser = function (room,user) {
    if (!user) {
        return;
    }
    var ru = cache.get('room.users');
    if (!ru[room]) {
        ru[room] = [];
    }
    console.log('rooms.addUser: '+user);
    ru[room].push(user);
    cache.set('room.users',ru)    
    console.log(ru[room]);
};

// remove user from room
obj.removeUser = function (room,user) {
    if (!user) {
        return;
    }
    var ru = cache.get('room.users');
    if (!ru[room]) {
        ru[room] = [];
    }
    console.log('rooms.removeUser: '+user);
    var index = ru[room].indexOf(user);
    if (index >= 0) {
        ru[room].splice(index,1);
    }
    cache.set('room.users',ru)
    console.log(ru[room]);
};

// return room's user list
obj.userList = function (room) {
    var ru = cache.get('room.users');
    return ru[room] || [] ;
};

module.exports = obj;
