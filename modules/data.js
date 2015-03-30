
var fs = require('fs');
var Promise = require('promise');
var cache = require('../modules/cache.js');

var obj = {};

var _dir = __dirname + '/data/';

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

obj.read('rooms.json').then(function (data) {
    if (!data || !data.data) {
        data.data = [];
    }
    cache.set('rooms',data.data);
    data.data.forEach(function (room) {
        obj.read(room.name+'-chat.json').then(function (data) {
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

setInterval(function () {
    var rooms = cache.get('rooms');
    rooms.forEach(function (room) {   
        var arr = cache.values[room.name+'.chat'];
        var dat = {data: arr};
        obj.write(room.name+'-chat.json',dat).then(function (response) {
    //        console.log('user data written.');
        }, function (err) {
            console.log(err);
        });
    });
}, 60000);

obj.read('users.json').then(function (data) {
    cache.set('users',data.data);
//    console.log(data);
}, function (err) {
    console.log(err);
    cache.set('users',[]);
});

setInterval(function () {
    var arr = cache.values['users'];
    var dat = {data: arr};
    obj.write('users.json',dat).then(function (response) {
//        console.log('user data written.');
    }, function (err) {
        console.log(err);
    });
}, 60000);


module.exports = obj;