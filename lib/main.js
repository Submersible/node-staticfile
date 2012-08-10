/*jslint node: true */
'use strict';

var fs = require('fs'),
    md5 = require('MD5'),
    Q = require('q'),
    walk = require('walk');

var hashes = {};

exports.hash = function (options) {
    var deferred = Q.defer(),
        inDir = options.input,
        outDir = options.cache,
        walker = walk.walk(inDir);

    walker.on('file', function (root, stats, next) {
        var path = root + '/' + stats.name;
        fs.readFile(path, function (err, data) {
            var hash;
            if (err) {
                deferred.reject(path + ':' + err);
                return;
            }
            hash = md5(data);
            hashes[path] = hash;

            // make target dir
            // cp file

            next();
        });
    });

    walker.on('end', function () {
        console.log('hashes', hashes);
        deferred.resolve(hashes);
    });

    return deferred.promise;
};
