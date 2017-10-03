import {createLogger} from "./lib/logger";
import {ServerConfig, serverConfig} from "./lib/server-config";
import {DatastoreService} from "./lib/datastore-service";

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
    if (!await DatastoreService.InitializeDatastoreAsync()) {
        logger.error("Failed to initialize datastore.");
        return false;
    }

    logger.info("Synchronize Datastore to Api Log Data ...");
    let logResult: [boolean, number] = await await DatastoreService.WebApiDataUtil.ProcessGuildLogsAsync();
    if (!logResult[0]) {
        logger.error("Failed to record log to store.");
        return false;
    }

    if ((logResult[0] && logResult[1] !== 0) || alwaysProcessMember) {
        logger.info("Synchronize Datastore to Api Member Data ...");
        if (!await DatastoreService.WebApiDataUtil.ProcessGuildMembersAsync()) {
            logger.error("Failed to record members to store.");
            return false;
        }
    }
    else {
        logger.info("No New Log Gathered, Skip Member List Update!");
    }

    logger.info("Initialize default members ... ");
    if (!await DatastoreService.PrepareInitialRoleDataAsync()) {
        logger.error("Failed to initialize members in the database");
        return false;
    }
    return true;
}

