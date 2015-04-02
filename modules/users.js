var cache = require('../modules/cache.js');
var _data = require('../modules/data.js');
var utils = require('../modules/utils.js');

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


// save user message data to disk
obj.saveMessages = function (user) {
    var arr = cache.values[user+'.messages'];
    var dat = {data: arr};
    _data.write('messages/'+user+'.json',dat).then(function (response) {
//        console.log('user data written.');
    }, function (err) {
        console.log(err);
    });
};

obj.newPM = function (from,data) {
    var msgs = cache.get(toUser+'.messages') || [];
    var toUser = data.user;
    var msg = {
        msg: data.msg,
        time: utils.dateTime(),
        from: from,
        read: false
    }
    msg.id = msgs.length + 1;
    msgs.push(msg);
    cache.set(toUser+'.messages',msgs);
    obj.saveMessages(toUser);
};

obj.readPM = function (user,id) {
    var msgs = cache.get(user+'.messages') || [];
    var index = -1;
    for (var i = 0; i < msgs.length; i++) {
        if (msgs[i].id === id) {
            index = i;
            break;
        }
    }
    if (index >= 0) {
        msgs[index].read = true;
        cache.set(user+'.messages',msgs);
        obj.saveMessages(user);
    }
};

obj.deletePM = function (user,id) {
    var msgs = cache.get(user+'.messages') || [];
    var index = -1;
    for (var i = 0; i < msgs.length; i++) {
        if (msgs[i].id === id) {
            index = i;
            break;
        }
    }
    if (index >= 0) {
        msgs.splice(index,1);
        cache.set(user+'.messages',msgs);
        obj.saveMessages(user);
    }
};

obj.PMList = function (user) {
    return cache.get(user+'.messages') || [];
};

// load user data, and user message to cache
_data.read('users.json').then(function (data) {
    cache.set('users',data.data);
    loadUserMessages(data.data);
//    console.log(data);
}, function (err) {
    console.log(err);
    cache.set('users',[]);
});

function loadUserMessages(data) {
    data.forEach(function (user) {
        _data.read('messages/'+user.name+'.json').then(function (data2) {
            if (!data2 || !data2.data) {
                data2.data = [];
            }
            cache.set(user.name+'.messages',data2.data);
        //    console.log(data);
        }, function (err) {
            console.log(err);
            cache.set(room.name+'.chat',[]);
        });       
    });    
}

module.exports = obj;
