/*jslint node: true */
'use strict';

var fs = require('fs.extra'),
    md5 = require('MD5'),
    path = require('path'),
    Q = require('q'),

    staticFile = require('./staticFile'),

    hashed = Q.defer(),

    lookup = function (file, callback) {
        hashed.then(function (hashes) {
            callback(hashes[file]);
        });
    },
    init = function (options) {
        var inDir = options.input,
            outDir = options.output,
            hashes = {},
            walker = fs.walk(inDir);

        walker.on('file', function (root, stats, next) {
            var fileName = stats.name,
                filePath = root + path.sep + fileName,
                newName,
                newPath,
                hash;
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    hashed.reject(filePath + ': ' + err);
                    return;
                }
                hash = md5(data);
                hashes[filePath] = hash;

                newName = staticFile.affix(fileName, hash);
                newPath = root.replace(inDir, outDir) + path.sep + newName;

                fs.mkdirp(path.dirname(newPath), function (err) {
                    if (err) {
                        hashed.reject(newPath + ': ' + err);
                        return;
                    }
                    fs.copy(filePath, newPath, function (err) {
                        if (err) {
                            hashed.reject(newPath + ': ' + err);
                            return;
                        }
                        next();
                    });
                });
            });
        });

        walker.on('end', function () {
            hashed.resolve(hashes);
        });
    },
    hashes = function (filters, callback) {
        var keys,
            subset;
        if (typeof filters === 'function') {
            callback = filters;
            filters = null;
        }
        hashed.then(function (error, hashes) {
            if (error) {
                callback(error);
                return;
            }
            if (!filters) {
                callback(null, hashes);
                return;
            }
            keys = Object.keys(hashes);
            subset = filters.reduce(hashes, function (subset, filter) {
                if (typeof filter === 'string') {
                    if (hashes.hasOwnProperty(filter)) {
                        subset[filter] = hashes[filter];
                    }
                } else {
                    // assume regex
                    keys.forEach(function (key) {
                        if (key.search(filter) > -1) {
                            subset[key] = hashes[key];
                        }
                    });
                }
                return subset;
            }, {});
            callback(null, subset);
        });
    };

lookup.init = init;
lookup.hashes = hashes;
module.exports = lookup;
