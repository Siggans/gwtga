'use strict';

const DefaultThreadCount = 24;

/* eslint-disable no-process-env */
module.exports = function (grunt) {
    const gruntSubtaskHelper = require('./grunt-promise-subtask')(grunt);
    const EnvName = 'UV_THREADPOOL_SIZE';

    if (process.env[EnvName]) {
        // Check if the UV_THREADPOOL_SIZE is set.  If it is, we assume override have occurred.
        grunt.log.writeln('Current ' + EnvName + ' is set to ' + process.env[EnvName].yellow);
        grunt.loadNpmTasks('grunt-sass');
        return;
    }

    /**
     * This grunt task is intended to be used as a process spawner for the sass task.  This is due to the node-sass bug
     * that causes race condition when importer option is specified
     * ( {@link https://github.com/sass/node-sass/issues/857 | See bug here } ).  We will use this task to set the
     * necessary workaround and spawn off a grunt to compile the files.
     */
    grunt.registerMultiTask('sass', 'Compile Sass to CSS', function () {
        /* eslint-disable no-invalid-this */
        // Disabled no-invalid-this due to 'this' is bound by grunt to the specific task when it is run.

        // For details on how a grunt task implementation works, please refer to
        // http://gruntjs.com/api/inside-tasks

        let done = this.async();

        const argName = this.nameArgs;
        let threadCount = getThreadNumber(grunt.option('max-threads'));

        grunt.log.writeln('Starting sass that may compile up to ' + (threadCount - 1) + ' files.');
        grunt.log.writeln('Use --max-threads (between 4 and 128 threads) to modify this number if the default count is not sufficient.');

        process.env[EnvName] = threadCount; // eslint-disable-line no-process-env

        // After the environment is set,  we need to start a new grunt process for the effect to take.
        new Promise(function (resolve) {
            // Check ems-types/build/index.js function sassHotfix(grunt) for the followup process.
            gruntSubtaskHelper(argName, resolve, done);
        })
        .then(() => {
            done();
        });

    });
};

/* eslint-enable no-process-env */

/**
 * A helper to convert an input string to numeric value, or a default value if input is invalid or out of range.
 *
 * @param {string | void} envVal - String value to be be parsed.
 * @returns {number}  The count of threads for setting environment value UV_THREADPOOL_SIZE.
 */
function getThreadNumber(envVal) {
    let threadCount = DefaultThreadCount;
    const ThreadMax = 128;
    const ThreadMin = 4;
    if (typeof envVal === 'string') {
        try {
            let temp = parseInt(envVal, 10);
            if (ThreadMin <= temp && temp <= ThreadMax) {
                threadCount = temp;
            }
        }
        catch (err) { // eslint-disable-line no-empty
            // we will use default value.
        }
    }
    return threadCount;

}
