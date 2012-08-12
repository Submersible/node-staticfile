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

//staticfile.hash({input: 'node_modules'});