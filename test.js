/*jslint node: true */

'use strict';

var test = require('tap').test,
    staticfile;

var staticFile = require('./staticFile');

// test('require', function (t) {
//     staticfile = require('../lib/main');
//     t.type(staticfile, 'object');
//     t.end();
// });

test('staticFile#affixFile', function (t) {
    t.equal(
        staticFile.affixFile('hello_world.min.js', 'FOOBAR'),
        'hello_world_FOOBAR.min.js',
        'two extensions'
    );
    t.equal(
        staticFile.affixFile('/js/external/jquery-v1.33.7.min.js', 'DEADBEEF'),
        '/js/external/jquery-v1_DEADBEEF.33.7.min.js',
        'two extensions with path'
    );
    t.equal(
        staticFile.affixFile('README', 'ZZZ'),
        'README_ZZZ',
        'no extension'
    );
    t.equal(
        staticFile.affixFile('../zz/README', 'RAWR'),
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

//staticfile.hash({input: 'node_modules'});