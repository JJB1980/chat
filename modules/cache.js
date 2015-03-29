
var obj = {
    values: [],
    set: function (key,data) {
        this.values[key] = data;
    },
    get: function (key) {
        return this.values[key];
    }
};

module.exports = obj;