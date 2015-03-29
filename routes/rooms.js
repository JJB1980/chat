var cache = require('../modules/cache.js');
var data = require('../modules/data.js');

var rooms = {
    data: [
        { name: "Lobby", icon: "home" },
        { name: "Air Balloons", icon: "airballoon" },
        { name: "Flying", icon: "airplane" },
        { name: "Shopping", icon: "basket" },
        { name: "Cakes", icon: "cake" },
        { name: "Automotive", icon: "car" },
        { name: "Dining", icon: "silverware" }
    ]
};

cache.set('rooms',rooms.data);

module.exports = rooms;
