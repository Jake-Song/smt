"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var ethereumjs_util_1 = require("ethereumjs-util");
var db_1 = require("./db");
var KEY_SIZE = 32;
var DEPTH = KEY_SIZE * 8;
var EMPTY_VALUE = ethereumjs_util_1.zeros(KEY_SIZE);
var Direction;
(function (Direction) {
    Direction[Direction["Left"] = 0] = "Left";
    Direction[Direction["Right"] = 1] = "Right";
})(Direction || (Direction = {}));
/**
 * Sparse Merkle tree
 */
var SMT = /** @class */ (function () {
    function SMT(hasher) {
        if (hasher === void 0) { hasher = ethereumjs_util_1.sha256; }
        this._hasher = hasher;
        this._db = new db_1.DB();
        this._defaultValues = new Array(DEPTH + 1);
        var h = EMPTY_VALUE;
        this._defaultValues[256] = h;
        for (var i = DEPTH - 1; i >= 0; i--) {
            var newH = this.hash(Buffer.concat([h, h]));
            this._db.set(newH, Buffer.concat([h, h]));
            this._defaultValues[i] = newH;
            h = newH;
        }
        this._root = h;
    }
    Object.defineProperty(SMT.prototype, "root", {
        get: function () {
            return this._root;
        },
        enumerable: true,
        configurable: true
    });
    SMT.prototype.put = function (key, value) {
        assert(key.byteLength === KEY_SIZE, "Key must be of size " + KEY_SIZE);
        var v = this._root;
        var siblings = [];
        for (var i = 0; i < DEPTH; i++) {
            var direction = getPathDirection(key, i);
            var res = this._db.get(v);
            if (!res)
                throw new Error('Value not found in db');
            if (direction === Direction.Left) {
                v = res.slice(0, 32);
                siblings.push([direction, res.slice(32, 64)]);
            }
            else {
                v = res.slice(32, 64);
                siblings.push([direction, res.slice(0, 32)]);
            }
        }
        if (value) {
            v = this.hash(value);
            this._db.set(v, value);
        }
        else {
            v = EMPTY_VALUE;
        }
        for (var i = DEPTH - 1; i >= 0; i--) {
            var _a = siblings.pop(), direction = _a[0], sibling = _a[1];
            var h = void 0;
            if (direction === Direction.Left) {
                h = this.hash(Buffer.concat([v, sibling]));
                this._db.set(h, Buffer.concat([v, sibling]));
            }
            else {
                h = this.hash(Buffer.concat([sibling, v]));
                this._db.set(h, Buffer.concat([sibling, v]));
            }
            v = h;
        }
        this._root = v;
    };
    SMT.prototype.get = function (key) {
        assert(key.byteLength === KEY_SIZE, "Key must be of size " + KEY_SIZE);
        var v = this._root;
        for (var i = 0; i < DEPTH; i++) {
            var direction = getPathDirection(key, i);
            var res = this._db.get(v);
            if (!res)
                throw new Error('Value not found in db');
            if (direction === Direction.Left) {
                v = res.slice(0, 32);
            }
            else {
                v = res.slice(32, 64);
            }
        }
        return v.equals(EMPTY_VALUE) ? undefined : this._db.get(v);
    };
    SMT.prototype.prove = function (key) {
        var v = this._root;
        var siblings = [];
        for (var i = 0; i < DEPTH; i++) {
            var direction = getPathDirection(key, i);
            var res = this._db.get(v);
            if (!res)
                throw new Error('Value not found in db');
            if (direction === Direction.Left) {
                v = res.slice(0, 32);
                siblings.push(res.slice(32, 64));
            }
            else {
                v = res.slice(32, 64);
                siblings.push(res.slice(0, 32));
            }
        }
        return siblings;
    };
    SMT.prototype.verifyProof = function (proof, root, key, value) {
        assert(proof.length === DEPTH, 'Incorrect proof length');
        var v;
        if (value) {
            v = this.hash(value);
        }
        else {
            v = EMPTY_VALUE;
        }
        for (var i = DEPTH - 1; i >= 0; i--) {
            var direction = getPathDirection(key, i);
            if (direction === Direction.Left) {
                v = this.hash(Buffer.concat([v, proof[i]]));
            }
            else {
                v = this.hash(Buffer.concat([proof[i], v]));
            }
        }
        return v.equals(root);
    };
    SMT.prototype.verifyCompactProof = function (cproof, root, key, value) {
        var proof = this.decompressProof(cproof);
        return this.verifyProof(proof, root, key, value);
    };
    SMT.prototype.compressProof = function (proof) {
        var bits = Buffer.alloc(KEY_SIZE);
        var newProof = [];
        for (var i = 0; i < DEPTH; i++) {
            if (proof[i].equals(this._defaultValues[i + 1])) {
                bits[Math.floor(i / 8)] ^= 1 << (7 - (i % 8));
            }
            else {
                newProof.push(proof[i]);
            }
        }
        return { bitmask: bits, proof: newProof };
    };
    SMT.prototype.decompressProof = function (cproof) {
        var proof = [];
        var proofNodes = cproof.proof.reverse();
        for (var i = 0; i < DEPTH; i++) {
            if (cproof.bitmask[Math.floor(i / 8)] & (1 << (7 - (i % 8)))) {
                proof.push(this._defaultValues[i + 1]);
            }
            else {
                var v = proofNodes.pop();
                if (v === undefined) {
                    throw new Error('Invalid compact proof');
                }
                proof.push(v);
            }
        }
        return proof;
    };
    SMT.prototype.hash = function (value) {
        return this._hasher(value);
    };
    return SMT;
}());
exports.SMT = SMT;
function getPathDirection(path, i) {
    var byte = path[Math.floor(i / 8)];
    var bit = byte & (1 << (7 - (i % 8)));
    return bit === 0 ? Direction.Left : Direction.Right;
}
//# sourceMappingURL=index.js.map