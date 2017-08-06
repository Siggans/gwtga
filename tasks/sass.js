'use strict';

const path = require('path');

module.exports = function (grunt) {

    // Configuration: https://www.npmjs.com/package/grunt-sass
    // This script sets the configuration for 'sass' grunt task(*).

    // * Note: Due to node-sass bug that causes file to compile only 3 sass files at once, we modify the sass task to a
    // local method that will set the work around before grunt-sass can be called.  The option for grunt-sass may still
    // be used.

    require('../util/grunt-sass-helper')(grunt);
    let importOnce = require('node-sass-import-once');

    return {
        options: {
            importer: importOnce,
            importOnce: {
                index: true,
                bower: true
            },
            style: 'compressed'
        },
        default: {
            expand: true,
            cwd: 'src/style',
            src: ['*.{scss,sass}', '!*sketch.{scss,sass}'],
            dest: 'artifacts/public/css/noprefix',
            rename: function (dest, src) {
                return path.join(dest, src.replace(/(\.scss|\.sass)$/, '.css'));
            }
        }
    };
};
