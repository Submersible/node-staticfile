/*jslint node: true */
'use strict';

var test = require("tap").test,
    staticfile;

test('require', function (t) {
    staticfile = require('../lib/main');
    t.type(staticfile, 'object');
    t.end();
});
//staticfile.hash({input: 'node_modules'});
