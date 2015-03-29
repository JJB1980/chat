var cache = require('../modules/cache.js');
var data = require('../modules/data.js');

var obj = {};

obj.authenticate = function (user) {
    
}

data.read('users.dat').then(function (data) {
    cache.set('users',data.data);
}, function (err) {
    console.log(err);
});

module.exports = obj;
