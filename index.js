/*jslint node: true */
'use strict';

var fs = require('fs.extra'),
    md5 = require('MD5'),
    path = require('path'),
    Q = require('q'),

    staticFile = require('./staticFile'),

    hashed = Q.defer(),
    hashedPromise = hashed.promise,

    lookup = function (file, callback) {
        hashedPromise.then(function (hashes) {
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
                    var copy = function () {
                        fs.copy(filePath, newPath, function (err) {
                            if (err) {
                                hashed.reject(newPath + ': ' + err);
                                return;
                            }
                            next();
                        });
                    };
                    fs.exists(newPath, function (exists) {
                        if (exists) {
                            fs.unlink(newPath, function (err) {
                                if (err) {
                                    hashed.reject(newPath + ': ' + err);
                                    return;
                                }
                                copy();
                            });
                        } else {
                            copy();
                        }
                    });
                });
            });
        });

        walker.on('end', function () {
            hashed.resolve(hashes);
        });
    },
    hashes = function (filters, callback) {
        if (typeof filters === 'function') {
            callback = filters;
            filters = null;
        }
        hashedPromise.fail(callback);
        hashedPromise.then(function (hashes) {
            var files,
                hashesSubset;
            if (!filters) {
                callback(null, hashes);
                return;
            }
            files = Object.keys(hashes);
            hashesSubset = filters.reduce(function (subset, filter) {
                if (typeof filter === 'string') {
                    if (hashes.hasOwnProperty(filter)) {
                        subset[filter] = hashes[filter];
                    }
                } else {
                    // assume regex
                    files.forEach(function (file) {
                        if (file.search(filter) > -1) {
                            subset[file] = hashes[file];
                        }
                    });
                }
                return subset;
            }, {});
            callback(null, hashesSubset);
        });
    };

lookup.init = init;
lookup.hashes = hashes;
module.exports = lookup;
