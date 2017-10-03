'use strict';

module.exports = (grunt) => {

    if (!grunt._opts && typeof (grunt._opts.outputPath) !== 'string') {
        throw new Error('Missing Project Distribution Path');
    }

    const outputPath = grunt._opts.outputPath;

    // configuration
    grunt.loadNpmTasks('grunt-contrib-watch');

    return {
        server: {
            files: 'src/server/**/*.ts',
            tasks: ['tslint', 'shell:typescript', 'sync:default']
        },
        client: {
            files: 'src/public/**/*',
            tasks: ['sync:dev-client', 'sync:default']
        },
        edit: {
            files: require('path').join(outputPath, 'client', '**/*'),
            tasks: [], // we just want to reload browser in case files changed.
            options: {
                livereload: true // default port is 39752
            }
        }
    };
};
