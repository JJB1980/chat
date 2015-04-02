
var fs = require('fs');
var Promise = require('promise');
var cache = require('../modules/cache.js');

var obj = {};

var _dir = __dirname + '/data/';

// read a file and parse returned data as json
obj.read = function (filename) {
    
    var promise = new Promise(function (resolve, reject) {
        console.log(_dir+filename);
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

module.exports = obj;