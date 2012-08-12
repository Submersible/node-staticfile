/*jslint node: true */
'use strict';

// deferreds in the style of node's callbacks
// ie, no difference between callbacks and errbacks
exports.deferred = function () {
    var callbacks = [],
        resolved = false,
        error,
        value,

        defer = {
            resolve: function (err, val) {
                var cbs = callbacks;
                callbacks = [];
                if (!resolved) {
                    error = err;
                    value = val;
                }
                cbs.forEach(function (cb) {
                    cb(error, value);
                });
            },
            then: function (cb) {
                if (resolved) {
                    cb(error, value);
                } else {
                    callbacks.push(cb);
                }
            },
            promise: function () {
                return {
                    then: defer.then,
                    promise: defer.promise
                };
            }
        };

    return defer;
};
