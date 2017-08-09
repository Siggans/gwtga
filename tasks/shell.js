'use strict';

module.exports = (grunt) => {

    // Configuration: https://www.npmjs.com/package/grunt-shell
    // Execute commands on shell
    grunt.loadNpmTasks('grunt-shell');

    return {
        option: {
            stdout: true,
            stderr: true
        },
        typescript: {
            command: (configName) => {
                let configFile = 'tsconfig' + (configName ? '-' + configName : '') + '.json';
                if (!require('fs').existsSync(configFile)) { // eslint-disable-line no-sync
                    grunt.fail.fatal('Cannot find ' + configFile);
                }
                grunt.log.ok('Using typescript configuration ' + configFile);
                return 'tsc -p ' + configFile + ' --listEmittedFiles';
            },
            options: {
                callback: function (err, stdout, stderr, cb) {
                    if (err) {
                        // Skip report error when error is no files.
                        if ((stdout || '').indexOf('TS18003') < 0 && (stderr || '').indexOf('TS18003') < 0) {
                            return cb(err);
                        }

                    }
                    return cb();
                }
            }
        }
    };
};
