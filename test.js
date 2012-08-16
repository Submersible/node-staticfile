/*jslint node: true, nomen: true */
'use strict';

var test = require('tap').test,
    fs = require('fs.extra'),
    md5 = require('MD5'),
    path = require('path');

var staticFile = require('./staticFile'),
    index = require('./index');

test('staticFile#affix', function (t) {
    t.equal(
        staticFile.affix('hello_world.min.js', 'FOOBAR'),
        'hello_world_FOOBAR.min.js',
        'two extensions'
    );
    t.equal(
        staticFile.affix('/js/external/jquery-v1.33.7.min.js', 'DEADBEEF'),
        '/js/external/jquery-v1_DEADBEEF.33.7.min.js',
        'two extensions with path'
    );
    t.equal(
        staticFile.affix('README', 'ZZZ'),
        'README_ZZZ',
        'no extension'
    );
    t.equal(
        staticFile.affix('../zz/README', 'RAWR'),
        '../zz/README_RAWR',
        'no extension with path'
    );
    t.end();
});

test('staticFile#function', function (t) {
    t.equal(
        staticFile('../hello/world'),
        '/hello/world',
        'truncates relative paths'
    );
    t.end();
});

test('index#init', function (t) {
    function sortHashes(hashes) {
        var hashed = Object.keys(hashes).reduce(function (h, file) {
            h.shift([file, hashes[file]]);
            return h;
        }, []);
        hashed.sort();
        return hashed;
    }
    var inDir = __dirname + '/static-test',
        outDir = __dirname + '/static-out',
        errTester = function (t, comment) {
            return function (err) {
                t.notOk(err, comment);
            };
        },
        files = {
            // <name>: <content>
            'js/stuff.js': 'here be stuff',
            'js/empty.js': '',
            'empty.css': '',
            'style.css': 'here be style',
            'empty': '',
            'afile': 'here be afile'
        },
        fileNames = Object.keys(files),
        fileHashes = sortHashes(fileNames.reduce(function (hashes, file) {
            var filePath = path.resolve(outDir + '/' + file);
            hashes[filePath] = md5(files[file]);
            return hashes;
        }, {}));

    t.test('setup', function (setup) {
        setup.plan(1 + fileNames.length);
        fs.mkdirp('static-test/js', function (err) {
            setup.notOk(err, 'create static-test/js');
            fileNames.forEach(function (file) {
                var filePath = inDir + '/' + file,
                    data = files[file];
                fs.writeFile(filePath, data, errTester(setup, 'create ' + filePath));
            });
        });
    });

    t.test('init', function (it) {
        // nothing I can think to test here,
        // but at least this waits for the above test
        index.init({input: inDir, output: outDir});
        it.end();
    });

    t.test('#hashes, no filter', {parallel: true}, function (ht) {
        ht.plan(2);
        index.hashes(function (error, hashes) {
            ht.notOk(error, 'hashing error (no filter)');
            ht.equal(sortHashes(hashes), fileHashes, 'all hashes #TODO');
            // TODO: check that only expected files exist
            // (ie the right hash in the right place)
        });
    });

    t.test('#hashes, empty filter', {parallel: true}, function (ht) {
        ht.plan(2);
        index.hashes([], function (error, hashes) {
            ht.notOk(error, 'hashing error (empty filter)');
            ht.equal(sortHashes(hashes), [], 'zero hashes #TODO');
        });
    });

    // TODO: test filtering on regexes and strings

    t.test('teardown', function (teardown) {
        teardown.plan(2);
        fs.rmrf(inDir, function (err) {
            teardown.notOk(err, 'rm -rf ' + inDir);
            fs.rmrf(outDir, errTester(teardown, 'rm -rf ' + outDir));
        });
    });

    t.end();
});
