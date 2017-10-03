import datastore from "../datastore";
import Util from "./util";
import {Transaction} from "sequelize";
import {Role} from "../datastore/model/Role";
import serverConfig from "./server-config";
import {User} from "../datastore/model/User";
import WebApiDataUtil from "./datstore-services/webapi-data-util";

const logger = Util.CreateLogger("lib/DatastoreService");

export class DatastoreService {

    public static WebApiDataUtil = WebApiDataUtil;

    public static async InitializeDatastoreAsync(): Promise<boolean> {
        await datastore.initializeAsync();
        return datastore.isInitialized;
    }

    public static async PrepareInitialRoleDataAsync(): Promise<boolean> {
        // this function will need to be customized depending on how your initial data is set up.

        const devRoleName = "DevAdmin";
        const devRoleRank = -1;
        const webAdminRoleName = "WebAdmin";
        const webAdminRoleRank = 0;

        try {
            await datastore.rawStore.transaction(async (t) => {
                let devRole: Role = await this.prepareInitialRoleDataAsync_findOrCreateRoleAsync(devRoleName, devRoleRank, t);
                let webAdminRole: Role = await this.prepareInitialRoleDataAsync_findOrCreateRoleAsync(webAdminRoleName, webAdminRoleRank, t);

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
                        user.oneTimeKeyExpire = Util.AddDayToDate(new Date(), 3);
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

    private static async prepareInitialRoleDataAsync_findOrCreateRoleAsync(roleName: string, roleRank: number, t: Transaction): Promise<Role> {
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

}
