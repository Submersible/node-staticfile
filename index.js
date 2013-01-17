/*jslint node: true, nomen: true, stupid: true */

'use strict';

var Q = require('q'),
    fs = require('fs.extra'),
    crypto = require('crypto'),
    path = require('path'),
    exec = Q.nfbind(require('child_process').exec);

var staticfile = require('./dist/browserify');

/**
 * Present the same Q interface for both sync/non-sync versions of fs commands.
 */
function fsCmd(cmd, sync) {
    var d, args = Array.prototype.slice.call(arguments, 2);
    if (sync) {
        d = Q.defer();
        try {
            d.resolve(fs[cmd + 'Sync'].apply(fs, args));
        } catch (e) {
            d.reject(e);
        }
        return d.promise;
    }
    return Q.ninvoke.apply(Q, [fs, cmd].concat(args));
}

/**
 * Recursively crawl a directory for all of it's files.
 */
function crawlDirectoryWithFS(parent, sync) {
    return fsCmd('readdir', sync, parent).then(function (things) {
        return Q.all(things.map(function (file) {
            file = path.join(parent, file);
            return Q.all([file, fsCmd('stat', sync, file)]);
        }));
    }).then(function (stats) {
        return Q.all(stats.map(function (args) {
            var file = args[0], stat = args[1];
            if (stat.isDirectory()) {
                return crawlDirectoryWithFS(file, sync);
            }
            return file;
        }));
    }).then(function (grouped) {
        return [].concat.apply([], grouped);
    });
}

/**
 * Crawl a directory for all of it's files!
 */
function crawlDirectory(parent, sync) {
    if (sync) {
        return crawlDirectory(parent, sync);
    }
    /* Use `find` if available, because it's fast! */
    return exec('find ' + parent + ' -not -type d').spread(function (stdin) {
        return stdin.split('\n').filter(function (file) {
            return !!file;
        });
    }).fail(function () {
        return crawlDirectoryWithFS(parent, sync);
    });
}

/**
 * Rewrite a assets to have the hash in their filename.
 *
 * I should add options to NOT ignore dotfiles, and also an options to move
 * instead of copy files.
 *
 * @param {Object} opts
 * @param {String} opts.input Directory of static files to rewrite
 * @param {String} opts.output Directory where to put rewritten files, can
 *                             be the same as the input dir
 * @param {Array<String>} [opts.files] List of files to rewrite instead of
 *                                     scanning the input directory
 * @param {String} [opts.move] Renames files instead of copying them
 * @param {Boolean} [opts.sync] Synchronous file modification
 * @param {Function} [opts.hash] Hash functions
 * @param {Function} [cb(err, hashes)] Callback function
 */
staticfile.rewrite = function (opts, cb) {
    var hashes = {},
        promise;

    opts.sync = false; // Q wraps things with a nextTick, which is preventing
                       // me from doing this :/

    opts.hash = opts.hash || function (data) {
        return crypto.createHash('sha1').update(data).digest('hex');
    };

    /* Rewrite directory */
    if (opts.files) {
        promise = Q.fcall(function () {
            return opts.files.map(function (file) {
                return path.join(path.resolve(process.cwd(), opts.input), file);
            });
        });
    } else {
        promise = crawlDirectory(opts.input, opts.sync);
    }

    promise = promise.then(function (files) {
        return Q.all(files.map(function (file) {
            var dir = path.dirname(file),
                rel = path.relative(opts.input, file);

            return fsCmd('readFile', opts.sync, file).then(function (data) {
                return opts.hash(data);
            }).then(function (hash) {
                hashes[rel] = hash;

                /* Rename */
                if (opts.move) {
                    return fsCmd(
                        'rename',
                        opts.sync,
                        file,
                        staticfile.affix(file, hash)
                    );
                }

                /* Copy */
                return fsCmd(
                    'mkdirp',
                    opts.sync,
                    path.dirname(path.join(opts.output, rel))
                ).then(function () {
                    return fsCmd(
                        'copy',
                        opts.sync,
                        file,
                        path.join(opts.output, staticfile.affix(rel, hash))
                    ).fail(function () {
                        /**
                         * Surpress error, don't overwrite.  May be good to
                         * make this an option, though.
                         */
                        return Q.defer().resolve();
                    });
                });
            });
        }));
    }).then(function () {
        staticfile.add(hashes);
        return hashes;
    });
    if (!cb) {
        return promise;
    }
    promise.then(function () {
        cb(false, hashes);
    }).fail(function (e) {
        cb(e);
    });
};

module.exports = staticfile;
