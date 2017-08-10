"use strict";
var childProcess = require("child_process");
module.exports = function (cmd, args, options) {
    var newOptions = Object.assign({
        encoding: "utf8",
        timeout: 10 * 1000 // 10 second time out
    }, options);
    return childProcess.spawnSync(cmd, args, newOptions);
};
