'use strict';

module.exports = (grunt) => {

    // configuration: https://www.npmjs.com/package/grunt-eslint
    grunt.loadNpmTasks('grunt-eslint');

    return {
        options: {
            configFile: '.eslint.json'
        },
        files: {
            src: [
                '*.js',
                'src/public/scripts/**/*.js',
                'src/server/**/*.js',
                'tasks/**/*.js',
                'util/**/*.js'
            ]
        }
    };

};
