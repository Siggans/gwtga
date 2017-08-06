
'use strict';

module.exports = function (grunt) {

    // This file provides configuration for grunt vulcanize task.
    // For configuration settings, please go to: https://github.com/Polymer/grunt-vulcanize

    grunt.loadNpmTasks('grunt-vulcanize');

    return {
        dist: {
            options: {
                inlineScripts: true,
                inlineCss: true,
                stripComments: true,
                stripExcludes: false
            },
            files: {
                'artifacts/public/components-v.html': 'artifacts/public/components.html'
            }
        }
    };
};
