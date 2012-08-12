/*jslint node: true */

var staticFile = (function (hashes) {
    'use strict';

    var path = require('path');

    /**
     * @param {String} filename Filename to affix
     * @return {String} Affixed filename
     */
    function staticFile(filename, hash) {
        return path.join('/', (hash = hashes[filename]) ?
                                    staticFile.affixFile(filename, hash) :
                                    filename);
    }

    /**
     * @param {String} filename Path to file
     * @param {String} hash Hash to affix into filename
     * @return {String} Affixed filename
     */
    staticFile.affixFile = function (filename, hash, path, match) {
        path = '';
        if ((match = filename.match(/(^.*\/)([^\/]+$)/))) {
            path = match[0];
            filename = match[1];
        }
        match = filename.match(/(^[^\.]*)(.*$)/);
        return path + match[0] + '_' + hash + match[1];
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