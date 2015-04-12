/* global module: true */

var obj = {};

obj.dateTime = function () {
    var d = new Date();   
    return d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+(d.getHours())+':'+d.getMinutes()+':'+d.getSeconds();
};

obj.uuid = function () {
    var abc = "abcdefghijklmnopqrstuvwxyz0123456789";
    var uuid = "";
    var index = 0;
    for (var i = 0; i < 20; i++) {
        index = Math.floor(Math.random() * 36);
        uuid += abc.substring(index,index+1);
    }
    return uuid;
};

obj.ok = function (val) {
    return (!val || val === '') ? false : true;
};

module.exports = obj;