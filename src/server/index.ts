import {Request, Response} from "express-serve-static-core";
import GW2Api = require("./lib/gw2api/index");

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

async function expressServerStartUp() {

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

    app.get("/test/logs", async (req: Request, res: Response) => {
        try {
            let logList = (await GW2Api.GetGuildLogAsync()).data as Array<any>;
            let body: string = "Total Count: " + logList.length + "<p>";
            logList.forEach((log) => {
                body += `${JSON.stringify(log)}<br>`;
            });
            body += "</p>";
            res.send(body);
        } catch (err) {
            console.log(err);
            res.status(500).end();
        }

    });

    app.get("/test/members", async (req: Request, res: Response) => {
        try {
            let memberList = await GW2Api.GetGuildMembersDataAsync();
            let body: string = "Total Count: " + memberList.length + "<ul>";
            memberList.forEach((member) => {
                body += `<li>${JSON.stringify(member)}</li>`;
            });
            body += "</ul>";
            res.send(body);
        } catch (err) {
            console.log(err);
            res.status(500).end();
        }
    });

    app.listen(app.get("port"), () => {
        console.log("Node app is running on port", app.get("port")); // tslint:disable-line no-console
    });
}


