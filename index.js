'use strict';

var debug = require('debuglog')('object-pool');


var proto = {

    acquire: function acquire(cb) {
        var obj;

        if (this.inUse.length === this.maxSize) {
            debug('queueing request');
            this.queue.unshift(cb);
            return;
        }

        obj = this.available.pop();
        if (!obj) {
            debug('creating instance');
            obj = this.factory();
            this.inUse.push(obj);
        }

        debug('fulfilling request with', obj);
        setImmediate(cb.bind(null, null , obj));
    },

    release: function release(obj) {
        var idx, cb;

        idx = this.inUse.indexOf(obj);
        if (idx > -1) {
            debug('releasing instance', obj);
            this.inUse.splice(idx, 1);
            this.available.unshift(obj);

            cb = this.queue.pop();
            if (typeof cb === 'function') {
                obj = this.available.pop();
                this.inUse.push(obj);

                debug('fulfilling request from queue', obj);
                setImmediate(cb.bind(null, null, obj));
            }
        }
    }

};


module.exports = function (factory, maxSize) {

    return Object.create(proto, {

        queue: {
            value: [],
            enumerable: true
        },

        available: {
            value: [],
            enumerable: true
        },

        inUse: {
            value: [],
            enumerable: true
        },

        factory: {
            value: factory,
            enumerable: true
        },

        maxSize: {
            value: maxSize || 100,
            enumerable: true
        }

    });

};