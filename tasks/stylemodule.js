
'use strict';

const path = require('path');
module.exports = function (grunt) {

    // Configuration: util/grunt-style-module.js
    // Generates a custom stylesheet or a polymer style dom for linkage.
    require('../util/grunt-style-module')(grunt);

    return {
        polymer: {
            options: {
                createStyleDom: true,
                createCustomStyle: false
            },

            expand: true,
            cwd: 'css',
            dest: 'css',
            src: ['*.{polymer,polymer.html}.css'],
            rename: function (dest, src) {
                return path.join(dest, src.replace(/(\.polymer\.)/g, '.'));
            }
        },

        'custom-style': {
            options: {
                createStyleDom: false,
                createCustomStyle: true
            },
            expand: true,
            cwd: 'css',
            dest: 'css',
            src: ['*.{html,html.polymer}.css'],
            rename: function (dest, src) {
                return path.join(dest, src.replace(/(\.html\.)/g, '.'));
            }
        }
    };
};
