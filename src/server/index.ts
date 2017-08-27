import {Request, Response} from "express-serve-static-core";
import GW2Api from "./lib/gw2api/index";
import {serverInitializationAsync} from "./server-initialize";
import {getOrmInstance} from "./datastore/orm-initialize";
import {serverConfig} from "./lib/server-config";
import {VerifyCallback} from "passport-google-oauth2";
import {LoginUser, QueryUserResult, Util} from "./lib/util";
import {NextFunction} from "express";
import {ApiController} from "./api/index";

const path = require("path");
const logger = Util.CreateLogger("main");
const url = require("url");
const compression = require("compression");
const express = require("express");
const session = require("express-session");
const SessionStore = require("connect-session-sequelize")(session.Store);
const bodyParser = require("body-parser");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const LocalStrategy = require("passport-local").Strategy;

const basePath: string = path.join(__dirname, "..");
const publicContentPath: string = path.join(basePath, "public");
const app = express();

expressServerStartUp();

async function expressServerStartUp() {

    let sessionStore = await expressServerInit();

    passport.use(new GoogleStrategy({
            clientID: serverConfig.googleClientId,
            clientSecret: serverConfig.googleClientSecret,
            callbackURL: url.resolve(serverConfig.host, "/oauth-google/callback"),
            passReqToCallback: true
        },
        async (req: Request, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {
            let userQuery: QueryUserResult = await Util.LoginUser.TryGetUserWithGoogleStratAsync(profile, req.user || {});
            if (userQuery.error) {
                done(true, userQuery.user, {message: userQuery.message});
            }
            done(null, userQuery.user);
        }
    ));

    passport.use(new LocalStrategy(
        {passReqToCallback: true},
        async (req: Request, username: string, password: string, done: VerifyCallback) => {
            let userQuery: QueryUserResult = await Util.LoginUser.TryGetUserWithLocalStratAsync(password, req.user || {});
            if (userQuery.error) {
                done(true, userQuery.user, {message: userQuery.message});
            }
            done(null, userQuery.user);
        }
    ));

    // Passport session setup.
    // https://github.com/mstade/passport-google-oauth2/blob/master/example/app.js#L18
    passport.serializeUser((user: LoginUser, done: (err: any, data: any) => void): void => {
        done(null, user);
    });

    passport.deserializeUser((user: LoginUser | string, done: (err: any, data: any) => void): void => {
        done(null, user);
    });

    // Let's get to the fun part.
    logger.info("Starting App Server ... ");

    // PORT env is set automatically in production server.
    app.set("port", (process.env.PORT || 8080));

    // Express session should be set before passport session is completed.
    // cookie and session storage setup
    app.use(session({
        resave: false, // required by connect-session-sequelize.
        store: sessionStore,
        secret: serverConfig.cookieSecret,
        saveUninitialized: true,
        cookie: {
            secure: serverConfig.environment === "PRODUCTION",
            maxAge: 7 * 24 * 3600 * 1000,
            httpOnly: true,
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.get("/oauth-google", passport.authenticate("google", {
        scope: [
            "https://www.googleapis.com/auth/plus.login",
            "https://www.googleapis.com/auth/plus.profile.emails.read"
        ]
    }));
    app.get("/oauth-google/callback", passport.authenticate("google", {
        successRedirect: "/",
        failureRedirect: "/login"
    }));

    app.post("/login", passport.authenticate("local", {failureRedirect: "/login"}));
    app.get("/logout", (req: Request, res: Response, next: NextFunction) => {
        req.logOut();
        next();
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

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

    app.use("/api", ApiController);

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

async function expressServerInit() {
    if (!await serverInitializationAsync()) {
        logger.error("Failed to initialize server...");
        process.exit(1);
    }

    let sessionStore;
    try {
        sessionStore = new SessionStore({
            db: getOrmInstance(),
            checkExpirationInterval: 15 * 60 * 1000,
            expiration: 7 * 24 * 3600 * 1000
        });
        await sessionStore.sync();
    }
    catch (err) {
        logger.error("Failed to establish session storage");
        process.exit(1);
    }
    return sessionStore;
}
