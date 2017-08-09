'use strict';

const path = require('path');
const fs = require('fs');

// Task loading using load-grunt-config
// Documentation may be found at https://www.npmjs.com/package/load-grunt-config
module.exports = (grunt) => {

    const projectRoot = path.join(__dirname);
    const projectName = path.basename(projectRoot);
    const herokuPath = path.join(projectRoot, '..', projectName + '-heroku-private');

    grunt.log.writeln('Apparent Project Name: ' + projectName.yellow);
    grunt.log.writeln('Computed Heroku Output: ' + herokuPath.yellow);

    if ('_opts' in grunt) { // make sure we are not overwriting existing properties
        throw new Error('grunt._opts property is being used,  we should pick another property');
    }

    grunt._opts = {
        outputPath: herokuPath
    };

    if (!fs.existsSync(herokuPath)) { // eslint-disable-line no-sync
        fs.mkdir(herokuPath);
        grunt.log.ok('Output path created...');
    }

    const configOpts = {
        configPath: [path.resolve(__dirname, 'tasks')],
        init: true,
        loadGruntTasks: false, // We will initialize each tasks by hand

        // Override these to perform custom initializations steps.
        postProcess: null,
        preMerge: null
    };

    require('load-grunt-config')(grunt, configOpts);
};
