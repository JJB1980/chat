var cache = require('../modules/cache.js');
var data = require('../modules/data.js');

var obj = {};

obj.newPM = function (toUser,msg) {
    var msgs = cache.get(toUser+'.messages') || [];
    msg.id = msgs.length + 1;
    msgs.push(msg);
    cache.set(toUser+'.messages',msgs);
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
    }
};

obj.PMList = function (user) {
    return cache.get(user+'.messages') || [];
};

module.exports = obj;
