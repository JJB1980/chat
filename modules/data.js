
var fs = require('fs');
var Promise = require('promise');
var cache = require('../modules/cache.js');

var obj = {};

var _dir = __dirname + '/data/';

// read a file and parse returned data as json
obj.read = function (filename) {
    
    var promise = new Promise(function (resolve, reject) {
        fs.readFile(_dir+filename, 'utf8', function(err, data) {
            if (err) {
                reject(err);
            }
            console.log('OK: ' + filename);
            console.log(data);
            if (data) {
                resolve(JSON.parse(data));
            } else {
                resolve({});
            }
        });
    });
    
    return promise;
};

// write to file, json stringify incoming data
obj.write = function (filename,data) {

    var promise = new Promise(function (resolve, reject) {
        fs.writeFile(_dir+filename, JSON.stringify(data), function(err) {
            if (err) {
                reject(err);
            }
            resolve(true);
        });
    });
    
    return promise;
};

// load rooms data, and chat data to cache
obj.read('rooms.json').then(function (data) {
    if (!data || !data.data) {
        data.data = [];
    }
    cache.set('rooms',data.data);
    data.data.forEach(function (room) {
        obj.read('chat/'+room.name+'.json').then(function (data) {
            if (!data || !data.data) {
                data.data = [];
            }
            cache.set(room.name+'.chat',data.data);
        //    console.log(data);
        }, function (err) {
            console.log(err);
            cache.set(room.name+'.chat',[]);
        });
    });
//    console.log(data);
}, function (err) {
    console.log(err);
    cache.set('rooms',[]);
});

// save chat room data to disk
setInterval(function () {
    var rooms = cache.get('rooms');
    rooms.forEach(function (room) {   
        var arr = cache.values[room.name+'.chat'];
        var dat = {data: arr};
        obj.write('chat/'+room.name+'.json',dat).then(function (response) {
    //        console.log('user data written.');
        }, function (err) {
            console.log(err);
        });
    });
}, (60000*2));

// load user data, and user message to cache
obj.read('users.json').then(function (data) {
    cache.set('users',data.data);
    data.data.forEach(function (user) {
         obj.read('messages/'+user.name+'.json').then(function (data) {
            if (!data || !data.data) {
                data.data = [];
            }
            cache.set(user.name+'.messages',data.data);
        //    console.log(data);
        }, function (err) {
            console.log(err);
            cache.set(room.name+'.chat',[]);
        });       
    });
//    console.log(data);
}, function (err) {
    console.log(err);
    cache.set('users',[]);
});

// save user data to disk
setInterval(function () {
    var arr = cache.values['users'];
    var dat = {data: arr};
    obj.write('users.json',dat).then(function (response) {
//        console.log('user data written.');
    }, function (err) {
        console.log(err);
    });
}, (60000*5));

// save user message data to disk
setInterval(function () {
    var users = cache.get('users');
    users.forEach(function (user) {   
        var arr = cache.values[user.name+'.messages'];
        var dat = {data: arr};
        obj.write('messages/'+user.name+'.json',dat).then(function (response) {
    //        console.log('user data written.');
        }, function (err) {
            console.log(err);
        });
    });
}, (60000*3));


module.exports = obj;