'use strict';

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
        dist: {
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
                        '.env',
                        'app.json',
                        'package.json',
                        'Procfile',
                        'Readme.md'
                    ],
                    dest: outputPath
                }

            ]
        }
    };
};
