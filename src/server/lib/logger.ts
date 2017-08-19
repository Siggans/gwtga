import {Winston} from "winston";

let winston = require("winston");

interface LoggerTemp extends Winston {
    createSubLogger?(subheader: string): Logger;
}

export interface Logger extends Winston {
    createSubLogger(subheader: string): Logger;
}

export function createLogger(header: string): Logger {
    let newHeader = header || "unknown";
    let consoleTransport = new (winston.transports.Console)({
        formatter: (options: any) => {
            return `[${winston.config.colorize(options.level, options.level.toLowerCase())}]:[${newHeader}] ${options.message || ""}` +
                (options.meta && Object.keys(options.meta).length ? "\n\t" + JSON.stringify(options.meta) : "" );
        },
        colorize: true,
        level: "verbose"
    });
    let logger = new (winston.Logger)({transports: [consoleTransport]}) as LoggerTemp;

    logger.createSubLogger = (subheader: string) => {
        return createLogger(newHeader + "#" + (subheader || "unknown"));
    };

    return logger as Logger;
}
