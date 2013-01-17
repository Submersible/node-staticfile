# node-staticfile—Hash & cache your assets! [![Build Status](https://secure.travis-ci.org/Submersible/node-staticfile.png?branch=master)](https://travis-ci.org/Submersible/node-staticfile)

[Back End Usage](#back-end-usage) – [Front End Usage](#front-end-usage) – [Common Integrations](#common-integrations)

Have static files that change, but wish you could speed them up with a cache?  Throw a hash of the contents in the filename!  Then cache the files forever!

This module will help you manage hashed static files, by doing the actual renaming of your static files to contain a hash.  Also, by giving you a map of your original filenames to the hashed ones.

## Back End Usage

All methods from the front end are also available from the back end.

### staticfile.rewrite({Object} opts);

__WARNING: This modifies your file system, use with caution!__

Rewrite your assets to contain a hash.

Options:
* `input` — Directory of assets.
* `output` — Directory to place rewritten files, can be the same as the input folder to do an in place modification.
* _Optional_ `files` — List of files to rewrite, instead of crawling the input directory.
* _Optional_ `move` — Move files instead of copying them.
* _Optional_ `hash` — SHA-1 is the default hashing algorithm.

```javascript
// 1. Rewrite assets
staticfile.rewrite({
    input: path.join(__dirname, 'static'),
    output: path.join(__dirname, 'static_build')
});

// 2. Store hashes for future use
fs.writeFileSync(
    JSON.stringify(staticfile.hashes()),
    path.join(__dirname, 'hash.json')
);

// 3. Blast your rewritten assets to a CDN!  For example:
exec('rsync static_build my-cdn-webserver:/home/http/staticfiles');
```

## Front End Usage

You can either download the JavaScript code below, or bundle this module with [Browserify](https://github.com/substack/node-browserify).

[Development Version (0.1.0)](https://raw.github.com/Submersible/node-staticfile/master/dist/staticfile.js) — 1.5 KiB, uncompressed with comments.

[Production Version (0.1.0)](https://raw.github.com/Submersible/node-staticfile/master/dist/staticfile.min.js) — 254 bytes, minified and gzipped.

### staticfile.add({Object} hashes);

Populates the module's state with a map of your original filenames to their hash.

```javascript
staticfile.add({
    '/my/file.png': 'c5b311f7ac637bdc18e15411e14151857a185a58',
    '/foo/bar.js': '2730149e24aba317517ad61ec245490926be303d'
    // ...
});
```

### var hashed_file = staticfile({String} file);

Returns the hashed version of the file, otherwise will return the same file if
it was not found in the map.

```javascript
console.log(staticfile('/foobar/my_file.png'));
// /foobar/my_file_7aea02175315cd3541b03ffe78aa1ccc40d2e98a.png
```

### staticfile.prefix({String} url_prefix);

Want the `staticfile` function to return a URL prefix for your CDN?  This function will set a state where `staticfile` will use your passed prefix.

```javascript
console.log(staticfile('/foobar/my_file.png'));
// /foobar/my_file_7aea02175315cd3541b03ffe78aa1ccc40d2e98a.png

staticfile.prefix('http://my-cdn.my-project.com');

console.log(staticfile('/foobar/my_file.png'));
// http://my-cdn.my-project.com/foobar/my_file_7aea02175315cd3541b03ffe78aa1ccc40d2e98a.png
```

### var hashed_file = staticfile.affix({String} file, {String} hash);

Put a hash into a filename.

```javascript
console.log(staticfile.affix('/foo/bar.min.js', 'DEADBEEF'));
// /foo/bar_DEADBEEF.min.js
```

## Common Integrations

### CSS

Rewrite all the `url()`s to instead use the hashed static files.

```javascript
// TODO
```

### Browserify

Bundle your hash map into your front end code.

```javascript
// Setup your Browserify bundle
var bundle = browserify({
    // ...
});

// Mount your hashes as a module in your bundle
bundle.include(
    '/node_modules/hashes/index.js',
    undefined,
    'module.exports = ' + JSON.stringify(staticfile.hashes()) + ';'
);

// Generate the JavaScript code to do as you please...
var code = bundle.bundle();
```

Then in your front end code:

```javascript
var config = require('config'), // You should have one of these. :)
    hashes = require('hashes'),
    staticfile = require('staticfile');

staticfile.prefix(config.static_url); // You probably want your files hosted on a CDN. :)
staticfile.add(hashes);
```

### Handlebars

Give the Handlebars compiler access to the `staticfile` function.

```javascript
var staticfile = require('staticfile'),
    handlebars = require('handlebars');

handlebars.registerHelper('staticfile', staticfile);
```

### Stylus

Give the Stylus compiler access to the `staticfile` function.

```javascript
var staticfile = require('staticfile'),
    stylus = require('stylus');

stylus('.my-css')
    .use(function (style) {
        style.define('staticfile', function (file) {
            return stylus.utils.coerce(
                staticfile(file.val)
            );
        });
    });
```
