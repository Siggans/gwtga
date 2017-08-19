import GW2Api from "../lib/gw2api/index";
import {MemberData} from "../lib/gw2api/api-types";
import {createLogger} from "../lib/logger";
import {datastore} from "../datastore/index";
import {User} from "../datastore/model/User";

const logger = createLogger("service/datastore-api-sync");
const noDate = getDateOnly(new Date(0));

export class DatastoreApiSync {

    public static async syncAllMembersAsync(): Promise<boolean> {
        return await syncAllMembersAsyncImpl(5);
    }

    public static async syncLogsAsync(): Promise<boolean> {
        return await syncLogsAsync();
    }
}
async function syncLogsAsync(): Promise<boolean> {
    throw new Error("Not Implemented");
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
                    user.left = getDateOnly(Date.now());
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
            if (getDateOnly(user.joined) === getDateOnly(member.joined) && user.guildRank === member.rank) {
                return;
            } else { // member data needs to be updated.

                let left = user.left >= user.joined;  // some dirty logic to see if member is a returned member.
                if (left) {
                    user.previousLeave = user.left;
                    user.left = noDate;
                    user.joined = getDateOnly(member.joined);
                    user.rejoinCount += 1;
                }

                user.guildRank = member.rank; // assume rank is modified.
                users.push(user);
            }
        } else { // new member!! Let's add the blood sacrifice.
            users.push(
                datastore.table.Users.build<User>({
                    gw2Account: member.name,
                    joined: getDateOnly(member.joined),
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
                    logger.verbose("Saving data to " + users[i].gw2Account);
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

function getDateOnly(date: Date | number): Date {
    let newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

export default DatastoreApiSync;
