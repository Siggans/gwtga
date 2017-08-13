import {Request, Response} from "express-serve-static-core";

const serverConfig = require("./lib/server-config");
const compression = require("compression");
const express = require("express");
const path = require("path");

const basePath: string = path.join(__dirname, "..");
const publicContentPath: string = path.join(basePath, "public");
const app = express();

if (!serverConfig.VerifyConfigExists()) {
    console.error("Cannot find server configuration file(s), exiting server initialization");
    process.exit(1);
}

const config = serverConfig.GetInstance();

if (!config.isValid) {
    console.error("Failed to retrieve necessary configuration values! Exiting server startup sequence.");
    process.exit(1);
}

expressServerStartUp();

function expressServerStartUp() {

    // PORT env is set automatically in production server.
    app.set("port", (process.env.PORT || 8080));

    // Use Compress response.
    app.use(compression({
        filter: (req: Request, res: Response) => {
            if (req.headers["x-no-compression"]) {
                return false;
            }
            return compression.filter(req, res);
        }
    }));

    // static resource service
    app.use(express.static(publicContentPath));

    app.get("/", (req: Request, res: Response) => {
        res.send("<p>Hello World?</p>");
    });

    app.listen(app.get("port"), () => {
        console.log("Node app is running on port", app.get("port")); // tslint:disable-line no-console
    });
}


