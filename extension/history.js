'use strict';

var MAX_LENGTH = 5;

function History() {
    this._cache = [];
}

History.prototype.add = function(username) {
    this._cache.unshift(username);
    while (this._cache.length > MAX_LENGTH) {
        this._cache.pop();
    }
};

History.prototype.find = function(username) {
    return this._cache.indexOf(username);
};

module.exports = History;