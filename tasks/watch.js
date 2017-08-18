'use strict';

module.exports = (grunt) => {

    // configuration
    grunt.loadNpmTasks('grunt-contrib-watch');

    return {
        server: {
            files: 'src/server/**/*.ts',
            tasks: ['tslint', 'shell:typescript', 'sync:default']
        }
    };
};
