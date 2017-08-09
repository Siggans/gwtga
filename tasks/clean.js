'use strict';

module.exports = (grunt) => {
    if (!grunt._opts && typeof (grunt._opts.outputPath) !== 'string') {
        throw new Error('Missing Project Distribution Path');
    }

    const outputPath = grunt._opts.outputPath;

    // Configuration: https://github.com/gruntjs/grunt-contrib-clean
    grunt.loadNpmTasks('grunt-contrib-clean');

    return {
        artifacts: [
            'artifacts/'
        ],

        packages: [
            'src/public/bower_components',
            'node_modules'
        ],

        output: {
            expand: true,
            cwd: outputPath,
            src: [
                'public/',
                'server/',
                'Procfile',
                'package.json'
            ],
            options: {
                // Needed to remove files outside the CWD.
                force: true
            }
        }
    };
};
