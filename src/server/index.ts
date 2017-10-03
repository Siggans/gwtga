import {Request, Response} from "express-serve-static-core";
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

    // Let's get to the fun part.
    logger.info("Starting App Server ... ");

    // PORT env is set automatically in production server.
    app.set("port", (process.env.PORT || 8080));
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");

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

    app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.user && req.user.isAuthenticated) {
            next();
        }
        req.session.lastUrl = req.originalUrl;
    });
    app.get("/oauth-google", passport.authenticate("google", {
        scope: [
            "https://www.googleapis.com/auth/plus.login",
            "https://www.googleapis.com/auth/plus.profile.emails.read"
        ]
    }));
    app.get("/oauth-google/callback", passport.authenticate("google", {
        successRedirect: "/login/success",
        failureRedirect: "/login"
    }));

    app.get("/login/success", (req: Request, res: Response) => {
        if (req.user && !req.user.isAuthenticated) {
            res.redirect("/login"); // GET on /login will be handled by client app.
        }
        res.redirect(req.session.lastUrl || "/");
    });

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

    // Static resource service
    app.use(express.static(publicContentPath));

    app.use("/api", ApiController);

    // Let client side take care of routing.
    app.get("*", (req: Request, res: Response) => {
        res.render("index", {
            title: serverConfig.appName,
            devEnv: !serverConfig.isProduction
        });
    });

    app.listen(app.get("port"), () => {
        logger.info("Node app is running on port", app.get("port")); // tslint:disable-line no-console
    });
}

async function expressServerInit() {
    if (!await serverInitializationAsync()) {
        logger.error("Failed to initialize server...");
        process.exit(1);
    }

    passportInitialize();

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

function passportInitialize() {

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
}
