var cache = require('../modules/cache.js');
var data = require('../modules/data.js');

var obj = {};

data.read('users.json').then(function (data) {
    cache.set('users',data.data);
//    console.log(data);
}, function (err) {
    console.log(err);
    cache.set('users',[]);
});

setInterval(function () {
    var arr = cache.values['users'];
    var dat = {data: arr};
    data.write('users.json',dat).then(function (response) {
//        console.log('user data written.');
    }, function (err) {
        console.log(err);
    });
}, 10000);

module.exports = obj;
