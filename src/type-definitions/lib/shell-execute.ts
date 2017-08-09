import {SpawnSyncOptions, SpawnSyncOptionsWithStringEncoding, SpawnSyncReturns} from "child_process";

import childProcess = require("child_process");

export = (cmd: string, args?: string[], options?: SpawnSyncOptions): SpawnSyncReturns<string> => {
    let newOptions: SpawnSyncOptionsWithStringEncoding = Object.assign(
        {
            encoding: "utf8",
            timeout: 10 * 1000 // 10 second time out
        },
        options as any
    );

    return childProcess.spawnSync(cmd, args, newOptions);
};


