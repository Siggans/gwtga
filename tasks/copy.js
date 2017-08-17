'use strict';

const path = require('path');

/**
 * Config copy task
 *
 * @param {Grunt} grunt - An instance of the grunt runner.
 * @returns {any} Configuration object for grunt.
 */
module.exports = (grunt) => {

    if (!grunt._opts && typeof (grunt._opts.outputPath) !== 'string') {
        throw new Error('Missing Project Distribution Path');
    }

    const outputPath = grunt._opts.outputPath;

    // Configuration: https://github.com/gruntjs/grunt-contrib-copy
    // This script sets the configuration for 'copy' grunt task.
    grunt.loadNpmTasks('grunt-contrib-copy');

    return {
        // This task copies the artifacts that we generated from compilation into another folder that we will
        // be using for heroku local testing and deployment.
        output: {
            files: [
                {
                    expand: true,
                    cwd: 'artifacts',
                    src: '**/*',
                    dest: outputPath
                },
                {
                    expand: true,
                    cwd: '.',
                    src: [
                        'package.json',
                        'package-lock.json',
                        'Procfile'
                    ],
                    dest: outputPath
                }
            ]
        },

        debug: {
            files: [
                {
                    expand: true,
                    cwd: '.',
                    src: [
                        'Procfile.debug'
                    ],
                    dest: outputPath,
                    rename: () => path.join(outputPath, 'Procfile')
                }
            ]
        },

        // This task is used to copy all resources such as html, pictures
        resources: {
            expand: true,
            cwd: 'src',
            src: [
                '**/*',
                '!type-definitions',
                '!type-definitions/**/*',
                '!public/bower_components',
                '!public/bower_components/**/*',
                '!**/*.sass'
            ],
            dest: 'artifacts'
        },

        // For development, we would want to copy over the entire bower directory and ts files
        dev: {
            files: [
                // Replicate the full bower directory in dev mode
                {
                    expand: true,
                    cwd: 'src',
                    src: ['public/bower_components/**/*'],
                    dest: 'artifacts'
                },
                {
                    // No need to vulcanize components while in development mode.
                    src: 'artifacts/public/components.html',
                    dest: 'artifacts/public/components-v.html'
                }
            ]
        },

        // For staging, we will need to determine which bower files we need to copy over that is not vulcanized.
        staging: {
            files: []
        }
    };
};
