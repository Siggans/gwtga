import {createLogger} from "./lib/logger";
import {ServerConfig, serverConfig} from "./lib/server-config";
import {datastore} from "./datastore/index";
import {Role} from "./datastore/model/Role";
import {User} from "./datastore/model/User";
import {Transaction} from "sequelize";
import {DatastoreApiSync} from "./service/datastore-api-sync";
import {Util} from "./lib/util";

const logger = createLogger("server-initialize");
const alwaysProcessMember = false;

export async function serverInitializationAsync(): Promise<boolean> {

    if (!ServerConfig.VerifyConfigExists()) {
        logger.error("Cannot find the server-config.json file under project root.");
        return false;
    }

    if (!serverConfig.isValid) {
        logger.error("Failed to retrieve necessary configuration values! Exiting server startup sequence.");
        return false;
    }

    logger.info("Initializing Datastore and Verify Model ...");
    if (!await datastore.initializeAsync() && !datastore.isInitialized) {
        logger.error("Failed to initialize datastore.");
        return false;
    }

    logger.info("Synchronize Datastore to Api Log Data ...");
    let logResult: [boolean, number] = await await DatastoreApiSync.syncLogsAsync();
    if (!logResult[0]) {
        logger.error("Failed to record log to store.");
        return false;
    }

    if ((logResult[0] && logResult[1] !== 0) || alwaysProcessMember) {
        logger.info("Synchronize Datastore to Api Member Data ...");
        if (!await DatastoreApiSync.syncAllMembersAsync()) {
            logger.error("Failed to record members to store.");
            return false;
        }
    }
    else {
        logger.info("No New Log Gathered, Skip Member List Update!");
    }

    logger.info("Initialize default members ... ");
    if (!await prepareInitialRoleDataAsync()) {
        logger.error("Failed to initialize members in the database");
        return false;
    }
    return true;
}

async function prepareInitialRoleDataAsync(): Promise<boolean> {
    // this function will need to be customized depending on how your initial data is set up.

    const devRoleName = "DevAdmin";
    const devRoleRank = -1;
    const webAdminRoleName = "WebAdmin";
    const webAdminRoleRank = 0;

    try {
        await datastore.rawStore.transaction(async (t) => {
            let devRole: Role = await prepareInitialRoleDataAsync_findOrCreateRoleAsync(devRoleName, devRoleRank, t);
            let webAdminRole: Role = await prepareInitialRoleDataAsync_findOrCreateRoleAsync(webAdminRoleName, webAdminRoleRank, t);

            let initValues: Array<any> = serverConfig.initialData;
            for (let i = 0; i < initValues.length; i++) {
                let value = initValues[i];
                let role: Role = value.role === devRoleName ? devRole : webAdminRole;
                let user = await datastore.table.Users.findOne<User>({where: {gw2Account: value.name}});
                if (!user) {
                    logger.verbose("Cannot find user " + value.name);
                    return false;
                }
                if (!user.$has("Role", role)) {
                    await user.$add("Role", role, {transaction: t});
                }
                if (value.key && !user.googleId) {
                    user.oneTimeKey = value.key;
                    user.oneTimeKeyExpire = Util.addDayToDate(new Date(), 3);
                    await user.save({transaction: t});
                }
            }
            return true;
        });
        return true;
    }
    catch (err) {
        logger.verbose("Error occurred while preparing initial data", err);
    }
    return false;
}

async function prepareInitialRoleDataAsync_findOrCreateRoleAsync(roleName: string, roleRank: number, t: Transaction): Promise<Role> {
    try {
        // having some problem getting findOrCreate to work.
        let role: Role = await datastore.table.Roles.findOne<Role>({where: {role: roleName, rank: roleRank}});
        if (!role) {
            role = datastore.table.Roles.build<Role>({role: roleName});
            role.setDataValue("rank", roleRank);
            await role.save({transaction: t});
            if (role.rank !== roleRank) {
                throw new Error(`Cannot register ${roleName} due to ${roleRank} not modified.`);
            }
        }
        return role;
    }
    catch (err) {
        logger.error("Error while retrieving " + roleName + ": ", err);
        return null;
    }
}
