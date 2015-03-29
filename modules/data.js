
var fs = require('fs');
var Promise = require('promise');

var obj = {};

var _dir = __dirname + '/data/';

obj.read = function (filename) {

    var promise = new Promise(function (resolve, reject) {
        fs.readFile(_dir+filename, 'utf8', function(err, data) {
            if (err) {
                reject(err);
            }
//            console.log('OK: ' + filename);
//            console.log(data);
            resolve(JSON.parse(data));
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

module.exports = obj;