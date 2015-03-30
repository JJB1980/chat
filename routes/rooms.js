var cache = require('../modules/cache.js');
var data = require('../modules/data.js');

var obj = {};

data.read('rooms.json').then(function (data) {
    if (!data || !data.data) {
        
    }
    cache.set('rooms',data.data);
    data.data.forEach(function (room) {
        data.read(room.name+'-chat.json').then(function (data) {
            if (!data || !data.data)
                data.data = [];
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

obj.userList = function (room) {
    var users = cache.get('users');
    var list = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].room === room) {
            list.push(users[i].name); 
        }
    }
    return list;
};

module.exports = obj;
