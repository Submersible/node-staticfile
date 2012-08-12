/*jslint node: true */

var staticFile = (function (hashes) {
    'use strict';

    var path = require('path');

    hashes = {};

    /**
     * @param {String} filename Filename to affix
     * @return {String} Affixed filename
     */
    function staticFile(filename, hash) {
        return path.join('/', (hash = hashes[filename]) ?
                                    staticFile.affix(filename, hash) :
                                    filename);
    }

    /**
     * @param {String} filename Path to file
     * @param {String} hash Hash to affix into filename
     * @return {String} Affixed filename
     */
    staticFile.affix = function (filename, hash, path, match) {
        path = '';
        if ((match = filename.match(/(^.*\/)([^\/]+$)/))) {
            path = match[1];
            filename = match[2];
        }
        match = filename.match(/(^[^\.]*)(.*$)/);
        return path + match[1] + '_' + hash + match[2];
    };

    /**
     * @param {Object} obj Map of filenames to hashes
     * @return {Object} this
     */
    staticFile.hash = function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                hashes[key] = obj[key];
            }
        }
        return this;
    };

    return staticFile;
}());

if (typeof module !== 'undefined') {
    module.exports = staticFile;
}