import {createLogger} from "./lib/logger";
import {ServerConfig, serverConfig} from "./lib/server-config";
import {datastore} from "./datastore/index";
import {DatastoreApiSync} from "./service/datastore-api-sync";

const logger = createLogger("server-initialize");

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
    if (!await datastoreInitAsync()) {
        logger.error("Failed to initialize datastore.");
        return false;
    }

    logger.info("Synchronize Datastore to Api Data ...");
    if (!await DatastoreApiSync.syncAllMembersAsync()) {
        logger.error("Failed to record members to list.");
    }

    // TODO:  Missing log record.
    // TODO:  Initialize members.
    return true;
}

async function datastoreInitAsync(): Promise<boolean> {
    let sync = await datastore.initializeAsync();
    logger.info("Datastore Initialization Completed: " + (sync ? "Yes" : "No"));

    return sync;
}

async function checkGuildChangesAsync(): Promise<boolean> {
    if (!datastore.isInitialized) {
        return false;
    }
    throw new Error("Not Implemented");
}
