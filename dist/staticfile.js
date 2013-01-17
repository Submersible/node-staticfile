/*jslint node: true, regexp: true */

var staticfile = (function (hashes, prefix) {
    'use strict';

    /**
     * @param {String} filename Filename to affix
     * @return {String} Affixed filename
     */
    function staticfile(filename, hash) {
        return prefix + (
            (hash = hashes[filename]) ?
            staticfile.affix(filename, hash) :
            filename
        );
    }

    /**
     * @param {String} prefix String to prefix hashed filenames with.
     * @return {Object} this
     */
    staticfile.prefix = function (str) {
        prefix = str;
        return this;
    };

    /**
     * @param {String} filename Path to file
     * @param {String} hash Hash to affix into filename
     * @return {String} Affixed filename
     */
    staticfile.affix = function (filename, hash, path, match) {
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
    staticfile.add = function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                hashes[key] = obj[key];
            }
        }
        return this;
    };

    /**
     * @return {Object} hashes
     */
    staticfile.hashes = function () {
        return hashes;
    };

    return staticfile;
}({}, ''));
