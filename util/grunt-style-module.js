'use strict';

const path = require('path');

module.exports = function (grunt) {

    /**
     * This function is intended to replicate the behavior of gulp-style-module for grunt.  This file will take
     * in a css file and create a custom-style stylesheet for include, or polymer style only dom.  The options can be
     * specified via:
     *
     * options: {
     *      createStyleDom: false,  // Create a stylesheet import file.
     *      createCustomStyle: true // Create a custom polymer element with the css sheet name as the name of the file.
     * }
     *
     * The implementation of this file will remove the .min part of a minified css file and use the file name
     * beforehand.
     */
    grunt.registerMultiTask('stylemodule', 'Create polymer css files', function () {
        /* eslint-disable no-invalid-this */
        // Disabled no-invalid-this due to 'this' is bound by grunt to the specific task when it is run.

        // For details on how a grunt task implementation works, please refer to
        // http://gruntjs.com/api/inside-tasks

        // Initialize default configurations.
        let options = this.options({
            createStyleDom: false,
            createCustomStyle: true
        });

        let fileCount = 0;

        grunt.verbose.writeln('Generate Polymer Style File: ' + (options.createCustomStyle ? 'Yes' : 'No').green);
        grunt.verbose.writeln('Generate Polymer Style Dom: ' + (options.createStyleDom ? 'Yes' : 'No').green);

        // Iterate over file groups
        this.files.forEach(function (f) {

            if (f.src.length === 0) {
                grunt.verbose.writeln('There are no file inputs.');
                return;
            }
            else if (f.src.length !== 1) {
                grunt.log.writeln('This task does not support merging multiple files.  Only first entry is processed.');
                grunt.log.writeln('Src input: ' + JSON.stringify(f.src, null, 2));
            }

            let srcPath = f.src[0];
            if (!grunt.file.exists(srcPath)) {
                grunt.verbose.writeln('Cannot find source file ' + srcPath + '.  Skipping this input.');
                return;
            }

            let destPath = f.dest;
            let destExt = path.extname(destPath);
            let destBase = destPath.slice(0, -destExt.length).replace('.min', '');
            let fileContent = grunt.file.read(srcPath);
            let nameBase = path.basename(destBase);

            if (options.createCustomStyle) {
                destPath = destBase + '.html';
                grunt.file.write(destPath,
                    '<style is="custom-style">\n'
                    + fileContent
                    + '\n</style>'
                );
            }
            if (options.createStyleDom) {
                destPath = destBase + '-styles.html';
                grunt.file.write(destPath,
                    '<dom-module id="' + nameBase + '-styles">\n<template>\n<style>\n'
                    + fileContent
                    + '\n</style>\n</template>\n</dom-module>'
                );
            }
            fileCount++;
        });
        grunt.log.write('>> '.green);
        grunt.log.writeln(String(fileCount).cyan + ' files converted.');
        /* eslint-enable no-invalid-this*/
    });
};
