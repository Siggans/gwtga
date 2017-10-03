'use strict';

const path = require('path');

module.exports = (grunt) => {

    if (!grunt._opts && typeof (grunt._opts.outputPath) !== 'string') {
        throw new Error('Missing Project Distribution Path');
    }

    const outputPath = grunt._opts.outputPath;

    // configuration: https://www.npmjs.com/package/grunt-sync
    grunt.loadNpmTasks('grunt-sync');

    return {
        default: {
            files: [
                {
                    expand: true,
                    cwd: 'artifacts/server',
                    dest: path.join(outputPath, 'server'),
                    src: '**/*'
                },
                {
                    expand: true,
                    cwd: 'artifacts/public',
                    dest: path.join(outputPath, 'public'),
                    src: '**/*'
                }
            ],
            failOnError: true,
            updateAndDelete: true,
            compareUsing: 'md5', // use file change to check for differences.
            options: {
                force: true // need to remove files outside the current project dir.
            }
        },

        'dev-client': {
            files: [{
                expand: true,
                cwd: 'src/public',
                dest: 'artifacts/public',
                src: '**/*'
            }],
            failOnError: true,
            updateAndDelete: true,
            compareUsing: 'md5'
        }
    };

};
