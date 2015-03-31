
var obj = {};

obj.dateTime = function () {
    var d = new Date();   
    return d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+(d.getHours())+':'+d.getMinutes()+':'+d.getSeconds();
};

module.exports = obj;