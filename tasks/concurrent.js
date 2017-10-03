'use strict';

module.exports = (grunt) => {

    // configuration: https://github.com/sindresorhus/grunt-concurrent
    grunt.loadNpmTasks('grunt-concurrent');

    return {
        watch: {
            tasks: ['watch:server', 'watch:client', 'watch:edit'],
            options: {
                limit: 3,
                logConcurrentOutput: true
            }

        }
    };
};
