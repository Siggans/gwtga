import {Request, Response, NextFunction, Router} from "express";
import express = require("express");
import {LoginUser} from "../lib/login-user-util";
const apiRouter: Router = express.Router();

// All api route needs user verification.  We do not use api key for authentication at the moment.
apiRouter.use(verifyAuthenticated);

export let ApiController: Router = apiRouter;

// For our use case, we only allow api call when user is authenticated.
function verifyAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.user && <LoginUser>(req.user).isAuthenticated) {
        next();
    }
    res.status(403).end();
}
