"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DB = /** @class */ (function () {
    function DB() {
        this._db = new Map();
    }
    DB.prototype.set = function (key, value) {
        this._db.set(key.toString('hex'), value);
    };
    DB.prototype.get = function (key) {
        return this._db.get(key.toString('hex'));
    };
    return DB;
}());
exports.DB = DB;
//# sourceMappingURL=db.js.map