var cache = require('../modules/cache.js');
var data = require('../modules/data.js');

var obj = {};

data.read('rooms.json').then(function (data) {
    cache.set('rooms',data.data);
//    console.log(data);
}, function (err) {
    console.log(err);
    cache.set('rooms',[]);
});

module.exports = obj;
