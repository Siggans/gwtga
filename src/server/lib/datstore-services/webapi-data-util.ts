import GW2Api from "../gw2api/index";
import {ApiResponseData, MemberData} from "../gw2api/api-types";
import {createLogger} from "../logger";
import {datastore} from "../../datastore/index";
import {User} from "../../datastore/model/User";
import {Log} from "../../datastore/model/Log";

const logger = createLogger("service/datastore-api-sync");
const noDate = new Date(0);

export class DatastoreApiSync {

    public static async ProcessGuildMembersAsync(): Promise<boolean> {
        return await syncAllMembersAsyncImpl(5);
    }

    public static async ProcessGuildLogsAsync(): Promise<[boolean, number]> {
        return await syncLogsAsync();
    }
}

async function syncLogsAsync(): Promise<[boolean, number]> {
    let log: Log = await datastore.table.Logs.findOne<Log>({order: [["id", "DESC"]]});
    let logs: ApiResponseData;
    if (log === null) {
        // We have no log yet, let's get all logs from api.
        logs = await GW2Api.GetGuildLogAsync();
    }
    else {
        logs = await GW2Api.GetGuildLogAsync(log.id);
    }

    if (!Array.isArray(logs.data)) {
        logger.error("Log data from api call cannot be read as array");
        return [false, 0];
    }

    let length = logs.data.length;
    if (logs.data.length !== 0) {
        try {
            await datastore.rawStore.transaction(async (t) => {
                for (let i = 0; i < length; i++) {
                    let data = logs.data[i];
                    let id: number = data.id;
                    let type: string = data.type || "unknown";
                    if (type === "unknown") {
                        logger.verbose("Log " + id + " has unknown type!!");
                    }
                    delete data.id;
                    delete data.type;
                    let jsonString = JSON.stringify(data, null, 0);
                    await datastore.table.Logs.create<Log>({
                        id: id,
                        type: type,
                        jsonString: jsonString
                    }, {transaction: t});
                }
            });
        }
        catch (err) {
            logger.verbose("Failed to record logs: ", err);
            return [false, 0];
        }

    }

    logger.info("Saved " + length + " logs ...");
    return [true, length];
}

async function syncAllMembersAsyncImpl(retry: number): Promise<boolean> {
    let memberList: MemberData[];
    try {
        memberList = await GW2Api.GetGuildMembersDataAsync();
        logger.verbose("Retrieved " + memberList.length + " member list.");
    } catch (err) {
        if (err.code && err.code === "ETIMEDOUT") {
            logger.verbose("Connection timed out: " + retry + " left");
            return retry === 0 ? false : await syncAllMembersAsyncImpl(retry - 1);
        } else {
            logger.verbose("Connection Error: ", err);
            return false;
        }
    }

    if (!memberList || memberList.length === 0) {
        return false;
    }

    if (!await syncAllMembersAsyncImpl_listToDatabase(memberList)) {
        return false;
    }

    return await syncAllMembersAsyncImpl_checkForMemberLeft(memberList);
}

async function syncAllMembersAsyncImpl_checkForMemberLeft(memberList: MemberData[]): Promise<boolean> {
    // we will need to check both list we have and the members data to see who left.
    // We will just query the member names into the string

    let userHash = {};

    memberList.forEach((member) => {
        userHash[member.name] = member;
    });

    let userList: User[] = await datastore.table.Users.all<User>({attributes: ["id", "gw2Account", "left", "joined"]});

    let leftUserList: User[] = [];
    userList.forEach((user) => { // go through list of all user and record ones not on member list.
        if (user.gw2Account in userHash || user.left >= user.joined) {
            return;
        }
        leftUserList.push(user); // list of users where name not on member list and left date is not updated.
    });

    if (leftUserList.length !== 0) {
        try {
            await datastore.rawStore.transaction(async (t) => {
                for (let i = 0; i < leftUserList.length; i++) {
                    let user = await datastore.table.Users.findById<User>(leftUserList[i].id);
                    user.left = new Date(Date.now());
                    if (i === leftUserList.length - 1) {
                        return await user.save({transaction: t});
                    }
                    await user.save({transaction: t});
                }
            });
        } catch (err) {
            logger.verbose("Failed to record changed member to list", err);
            return false;
        }
    }
    logger.info("Registered/Updated " + leftUserList.length + " members that left guild ...");
    return true;

}

async function syncAllMembersAsyncImpl_listToDatabase(memberList: MemberData[]): Promise<boolean> {

    let users: User[] = []; // push the records that needs to be saved in here.
    // go through the member list and create or update as needed.
    for (let i = 0; i < memberList.length; i++) {
        let member = memberList[i];
        let user: User = await datastore.table.Users.findOne<User>({where: {gw2Account: member.name}});
        if (user) { // user exist.  Let's check some information if it's accurate.
            if (+user.joined === +member.joined && user.guildRank === member.rank) {
                continue;
            }
            // member data needs to be updated.
            logger.verbose(`Updating ${member.name} due to ${user.guildRank !== member.rank ? "rank changed" : "joined date modified"}`);
            let left = user.left > user.joined;  // some dirty logic to see if member is a returned member.
            if (left) {
                user.previousLeave = user.left;
                user.left = noDate;
                user.joined = member.joined;
                user.rejoinCount += 1;
            }
            user.joined = member.joined;
            user.guildRank = member.rank;
            users.push(user);
        }
        else { // new member!! Let's add the blood sacrifice.
            logger.verbose("Saving new user " + member.name);
            users.push(
                datastore.table.Users.build<User>({
                    gw2Account: member.name,
                    joined: member.joined,
                    guildRank: member.rank,
                    left: noDate,
                    previousLeave: noDate,
                    hash: null
                })
            );
        }
    }

    if (users.length !== 0) {
        try {
            await datastore.rawStore.transaction(async (t) => {
                for (let i = 0; i < users.length; i++) {

                    if (i === users.length - 1) {
                        return await users[i].save({transaction: t});
                    }
                    await users[i].save({transaction: t});
                }
            });
        } catch (err) {
            logger.verbose("Failed to save users to database", err);
            return false;
        }
    }

    logger.info("Registered/Updated " + users.length + " members...");
    return true;
}

export default DatastoreApiSync;
