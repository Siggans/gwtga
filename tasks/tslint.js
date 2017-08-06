'use strict';

module.exports = (grunt) => {

    // configuration: https://www.npmjs.com/package/grunt-tslint
    grunt.loadNpmTasks('grunt-tslint');

    return {
        options: {
            configuration: 'tslint.json'
        },
        files: {
            src: 'src/server/**/*.ts'
        }
    };

};
