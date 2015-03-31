var cache = require('../modules/cache.js');
var data = require('../modules/data.js');

var obj = {};

// store the user's room
obj.setRoom = function (user,room) {
    var users = cache.get('users');
    for (var i = 0; i < users.length; i++) {
        if (users[i].name === user) {
            users[i].room = room;
            break;
        }
    }
    cache.set('users',users);
};

// get the users's room
obj.getRoom = function (user) {
    var users = cache.get('users');
//    console.log(users);
    var room = '';
    for (var i = 0; i < users.length; i++) {
        if (users[i].name === user) {
            room = users[i].room;
            break;
        }
    }
    return room;
};

module.exports = obj;
