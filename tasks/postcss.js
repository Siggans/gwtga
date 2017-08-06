'use strict';

module.exports = function (grunt) {

    // Configuration: https://github.com/nDmitry/grunt-postcss
    // This tool can apply several css processing for transform and lint of css code. Based on our need, this tool may be
    // used for modifying the trans-piled css, apply autoprefixer, and minifiy.  See https://github.com/postcss/postcss
    // for possible processors.
    grunt.loadNpmTasks('grunt-postcss');

    let prefixer = require('autoprefixer')({browsers: ['last 2 version']});

    return {
        options: {
            processors: [prefixer]
        },

        default: {
            expand: true,
            cwd: 'artifacts/public/css/noprefix',
            src: '*.css',
            dest: 'artifacts/public/css'
        }
    };
};
