var cache = require('../modules/cache.js');
var _data = require('../modules/data.js');
var utils = require('../modules/utils.js');

var obj = {};

// store the user's room
obj.setRoom = function (user,room) {
    var index = findUser(user);
    if (index >= 0) {
        cache.values['users'][index].room = room;
    }
    obj.saveUsers();
};

// get the users's room
obj.getRoom = function (user) {
    var room = '';
    var index = findUser(user);
    return (index >= 0) ? cache.values['users'][index].room : '';
};

function findUser(name) {
    var users = cache.get('users');
    for (var i = 0; i < users.length; i++) {
        if (users[i].name === name) {
            return i;
        }
    }
    return -1;
}

obj.authorised = function (user,token) {
    var index = findUser(user);
    return (cache.values['users'][index].token === token);
}

obj.newPM = function (from,data) {
    var toUser = data.user;
    var msg = {
        msg: data.msg,
        time: utils.dateTime(),
        from: from,
        read: false
    }
    msg.id = cache.values[toUser+'.messages'].length + 1;
    cache.values[toUser+'.messages'].push(msg);
    obj.saveMessages(toUser);
    return msg;
};

function findUserMessage(user,id) {
    var msgs = cache.get(user+'.messages') || [];
    var index = -1;
    for (var i = 0; i < msgs.length; i++) {
        if (msgs[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
}

obj.readPM = function (user,id) {
    var msgs = cache.get(user+'.messages') || [];
    var index = findUserMessage(user,id);
    if (index >= 0) {
        cache.values[user+'.messages'][index].read = true;
        obj.saveMessages(user);
    }
};

obj.deletePM = function (user,id) {
    var msgs = cache.get(user+'.messages') || [];
    var index = findUserMessage(user,id);
    if (index >= 0) {
        cache.values[user+'.messages'].splice(index,1);
        obj.saveMessages(user);
    }
};

obj.PMList = function (user) {
    return cache.get(user+'.messages') || [];
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
            cache.set(user.name+'.messages',data2.data);
//            console.log(user.name+'.messages');
//            console.log(data2.data);
        //    console.log(data);
        }, function (err) {
            console.log(err);
            cache.set(user.name+'.messages',[]);
        });       
    });    
}

obj.saveUsers = function () {
    try {
//        console.log('write users');
        var arr = cache.values['users'];
        var dat = {data: arr};
        _data.write('users.json',dat).then(function (response) {
    //        console.log('user data written.');
        }, function (err) {
            console.log(err);
        });    
    } catch(err) {
        console.log(err);
    }    
};

module.exports = obj;
