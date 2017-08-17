'use strict';

/**
 * Config copy task
 *
 * @returns {any} Configuration object for grunt.
 */
module.exports = (/* grunt */) => { // eslint-disable-line arrow-body-style

    return {
        default: {
            description: 'Grunt default task',
            tasks: ['dev-build']
        },

        'debug-build': {
            description: 'Setting up Debug Build',
            task: [
                'clean-workspace',
                'copy:resources',
                'compile',
                'copy:dev',
                'copy:output',
                'copy:debug'
            ]
        },

        'dev-build': {
            description: 'Setting up Developer Build',
            tasks: [
                'clean-workspace',
                'copy:resources',
                'compile',
                'copy:dev',
                'copy:output'
            ]
        },

        'staging-build': {
            description: 'Setting up Developer Build',
            tasks: [
                'clean-workspace',
                'copy:resources',
                'compile',
                'copy:staging',
                'vulcanize',
                'copy:output'
            ]
        },

        'clean-workspace': {
            description: 'Clean up current workspace',
            tasks: [
                'clean:output',
                'clean:artifacts'
            ]
        },

        compile: {
            description: 'Compile all scripts',
            tasks: [

                // stylesheet processing
                'sass:default',
                'postcss:default',
                'stylemodule:polymer',
                'stylemodule:custom-style',

                // js/ts lint and compilation
                'eslint',
                'tslint',
                'shell:typescript'
            ]
        }
    };

};
