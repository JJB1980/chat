var cache = require('../modules/cache.js');
var _data = require('../modules/data.js');
var utils = require('../modules/utils.js');

var obj = {};

cache.set('room.users', []);

// load rooms data, and chat data to cache
_data.read('rooms.json').then(function (data) {
    if (!data || !data.data) {
        data.data = [];
    }
    cache.set('rooms',data.data);
    loadRoomChat(data.data);    
//    console.log(data);
}, function (err) {
    console.log(err);
    cache.set('rooms',[]);
});

function loadRoomChat(data) {
    data.forEach(function (room) {
        _data.read('chat/'+room.name+'.json').then(function (data2) {
            console.log('rooms.load');
            console.log(room);
            console.log(data2);
            if (!data2 || !data2.data) {
                data2.data = [];
            }
            cache.set(room.name+'.chat',data2.data);
        //    console.log(data);
        }, function (err) {
            console.log('ERROR: '+err);
            cache.set(room.name+'.chat',[]);
        });
    });
}

obj.addMessage = function (room,user,data) {
    var chat = cache.get(room+'.chat') || [];
    // only keep the last 50 messages;
    if (chat.length >= 50) {
        chat.shift();
    }
    var msg = {
        time: utils.dateTime(),
        msg: data,
        user: user
    };   
    chat.push(msg);
    cache.set(room+'.chat',chat)
    rooms.saveMessages(room);
    return msg;
};

// add user to room
obj.addUser = function (room,user) {
    if (!user) {
        return;
    }
    var ru = cache.get('room.users');
    if (!ru[room]) {
        ru[room] = [];
    }
    console.log(room+'.addUser: '+user);
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
    console.log(room+'.removeUser: '+user);
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


// save chat room data to disk
obj.saveMessages = function (room) {
    var arr = cache.values[room+'.chat'];
    var dat = {data: arr};
    _data.write('chat/'+room+'.json',dat).then(function (response) {
//        console.log('user data written.');
    }, function (err) {
        console.log(err);
    });
};

module.exports = obj;
