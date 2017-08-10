import {Winston} from "winston";

let winston = require("winston");

export = (header: string): Winston => {
    let newHeader = header || "unknown";
    let consoleTransport = new (winston.transports.Console)({
        formatter: (options: any) => {
            return `${new Date().toISOString()} [${options.level.toLowerCase()}]}: ${newHeader} - ${options.message || ""}` +
                (options.meta && Object.keys(options.meta).length ? "\n\t" + JSON.stringify(options.meta) : "" );
        }
    });
    return new (winston.Logger)({transports: [consoleTransport]});
};
