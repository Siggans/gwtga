import {datastore} from "../datastore/index";
import {User} from "../datastore/model/User";
import {createLogger} from "./logger";
import {Role} from "../datastore/model/Role";
import {Transaction} from "sequelize";

const logger = createLogger("lib/login-user-util");

type FindCountResult<T> = {
    rows: T[];
    count: number;
};

export interface LoginUser {
    // Main user attributes
    id?: number;
    name?: string;
    isAuthenticated?: boolean;
    role?: {
        expire: Date;
        array: number[];
    };

    // Google authentication results
    googleId?: string;
    googleEmail?: string;

    // Local authentication results
    password?: string;
}

export class QueryUserResult {
    constructor(error: boolean, user: LoginUser, message?: string) {
        this.error = error;
        this.user = user;
        this.message = message;
    }

    public readonly error: boolean;
    public readonly user: LoginUser;
    public readonly message?: string;
}

export class LoginUserUtil {

    public static InitializeUserWithGoogleProfile(profile: any, user: LoginUser | null): LoginUser {
        // No need to repeat login process when user is already authenticated
        if (user && user.isAuthenticated) {
            return user;
        }
        return Object.assign({googleId: profile.id as string, googleEmail: profile.email as string}, user || {});
    }

    public static InitializeUserWithLocalLogin(key: string, user: LoginUser | null): LoginUser {
        if (user && (user.isAuthenticated)) {
            return user;
        }
        return Object.assign({password: key}, user || {});
    }

    public static async TryGetUserWithGoogleStratAsync(profile: any, user: LoginUser): Promise<QueryUserResult> {
        if (user.isAuthenticated) {
            return new QueryUserResult(false, user);
        }

        let lu = LoginUserUtil.InitializeUserWithGoogleProfile(profile, user);

        // User id is found, we've already found the user before.  Let's update the record and return.
        if (typeof(lu.id) === "number") {
            lu = await LoginUserUtil.UpdateUserWithIdAsync(lu);
            return new QueryUserResult(false, lu);
        }

        try {
            let dbUserCountList: FindCountResult<User> = await datastore.table.Users.findAndCountAll<User>({
                where: {$or: [{googleId: user.googleId}, {googleAccountEmail: user.googleEmail}]},
                include: [{model: Role, as: "Roles"}]
            });

            // we can find 0, 1, or, worst situation, more than 1 result.
            // nothing to do when we have 0 user found.  Need more info before we can find a user.
            if (dbUserCountList.count > 1) {
                // This is not a good sign.  means someone probably used the same email twice or have duplicate account
                // We are not handling this specificase atm.
                logger.error(`Finding duplicated user info with googleId = ${user.googleId}, email = ${user.googleEmail}`);
                throw new Error("Unable to find correct user.  This error is probably our goof, please inform the guild owner or web admin about this error");
            } else if (dbUserCountList.count === 1) {
                // found user, save the id and email if we need to, and if modified, saved the data.
                lu = await LoginUserUtil.AuthenticateSaveDbUserIfModifiedAsync(lu, dbUserCountList.rows[0]);
            }
            // Nothing to do if user count is zero.  We don't have enough info to find user yet.
        } catch (err) {
            logger.error("Failed google authentication search: ", err);
            return new QueryUserResult(true, lu, err instanceof Error || err.message ? err.message : err.toLocaleString());
        }
        return new QueryUserResult(false, lu);
    }

    public static async TryGetUserWithLocalStratAsync(key: string, user: LoginUser): Promise<QueryUserResult> {
        // We mainly only use one time key to grab id, if it's already found, we don't have anything to do here.
        // And of course, no need to re-authenticate when user is already authenticated.
        if (user.isAuthenticated || user.id) {
            return new QueryUserResult(false, user);
        }

        let lu = LoginUserUtil.InitializeUserWithLocalLogin(key, user);

        try {
            let dbUserList: FindCountResult<User> = await datastore.table.Users.findAndCountAll<User>({
                where: {$and: [{oneTimeKey: key}, {oneTimeKeyExpire: {$lt: new Date()}}]}
            });

            if (dbUserList.count > 1) {
                // this will mostly come from misconfigured server and badly randomlized key (my bad).
                logger.error(`Finding duplicated user info with oneTimKey = ${key}`);
                throw new Error("Duplicated key found: " + key);
            } else if (dbUserList.count === 1) {
                // list can only have 0 or 1 since onetimekey has unique constraint. So this will most likely be the result if db is set up correctly.
                let dbUser = dbUserList.rows[0];
                lu.id = dbUser.id;
                lu.name = dbUser.gw2Account;
                lu = await LoginUserUtil.AuthenticateSaveDbUserIfModifiedAsync(lu, dbUser);
            }
        } catch (err) {
            logger.error("Failed google authentication search: ", err);
            return new QueryUserResult(true, lu, err instanceof Error || err.message ? err.message : err.toLocaleString());
        }
        return new QueryUserResult(false, lu);
    }

    public static async UpdateUserWithIdAsync(user: LoginUser): Promise<LoginUser> {
        let dbUser = await datastore.table.Users.findById<User>(user.id);
        return await LoginUserUtil.AuthenticateSaveDbUserIfModifiedAsync(user, dbUser);
    }

    private static async AuthenticateSaveDbUserIfModifiedAsync(user: LoginUser, dbUser: User): Promise<LoginUser> {
        // Prevent non 3rd party authenticated account.
        if (!user.googleId) {
            return user;
        }

        if (checkForSaveNeeded(user, dbUser)) {
            await datastore.rawStore.transaction(async (t: Transaction) => {
                return await dbUser.save({transaction: t});
            });
        }

        return {
            id: dbUser.id,
            name: dbUser.gw2Account,
            isAuthenticated: Boolean(dbUser.oneTimeKey),
        };
    }
}

function checkForSaveNeeded(user: LoginUser, dbUser: User): boolean {
    let isModified = false;
    let isUsingExternalCheckIn = false;

    // Note!  OneTimeKey is needed for oauthID change to take effect, unless they are empty before.

    // Google login modification
    if (user.googleId) {
        isUsingExternalCheckIn = true;
        // Only allow google id modification when it does not exist, or when one time key is present and is supplied by user.
        if (!dbUser.googleId || (dbUser.googleId && dbUser.oneTimeKey && dbUser.oneTimeKey === user.password)) {
            dbUser.googleId = user.googleId;
            isModified = true;
        }
        else if (user.googleId !== dbUser.googleId) {
            // Id mismatch, but we aren't editing.  There's something fishy...
            return false;  // prevent database update.
        }

        // save change to email
        if (user.googleEmail && user.googleEmail !== dbUser.googleAccountEmail) {
            dbUser.googleAccountEmail = user.googleEmail;
            isModified = true;
        }
    }

    // when external login is used, let's delete the one time key.
    if (isUsingExternalCheckIn && dbUser.oneTimeKey) {
        dbUser.oneTimeKey = null;
        isModified = true;
    }
    return isModified;
}
