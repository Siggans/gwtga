'use strict';

module.exports = (grunt) => {

    /**
     * A helper function that is used in order to facilitate running
     * [grunt.util.spawn]{@link http://gruntjs.com/api/grunt.util#grunt.util.spawn} as a Promise task.
     *
     * @param {string} taskName - The task to be executed using child spawn process.
     * @param {Function} resolve - Callback routine for success subtask execution.
     * @param {Function} reject - Callback routine for failure subtask execution.
     */
    function gruntSubtaskPromiseHelper(taskName, resolve, reject) {

        // See http://gruntjs.com/api/grunt.util#grunt.util.spawn for available options
        let options = {
            cmd: 'grunt', // We have to manually kick off another grunt since the config options needs to be reinitialized.
            args: [taskName],
            opts: {
                stdio: 'inherit'
            }
        };

        grunt.log.writeln();
        grunt.log.subhead(('Starting Sub-Task \'' + taskName + '\''));
        grunt.util.spawn(options, (error, result, code) => {
            /* eslint-disable dot-notation */
            grunt.log.write('\nReturned from sub-task \'' + taskName + '\': ');
            grunt.log.writeln(code === 0 ? 'SUCCESS!'['green'] : 'ERROR!'['red']);
            /* eslint-enable dot-notation */

            if (code !== 0) {
                return reject(false);
            }
            return resolve();
        });
    }

    return gruntSubtaskPromiseHelper;
};
