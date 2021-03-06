import {ApiResponseData, MemberData, RequestOption} from "./api-types";
import {requestAsync} from "./request-async";
import {serverConfig} from "../server-config";
import {createLogger} from "../logger";

const logger = createLogger("lib/gw2api/");
class GW2Api {

    public static async GetGuildMembersAsync(): Promise<ApiResponseData> {
        let url = `/v2/guild/${serverConfig.guildId}/members`;
        return await requestAsync(url, {authenticate: true});
    }

    public static async GetGuildLogAsync(since?: number): Promise<ApiResponseData> {
        // log request has longer running time.  We should avoid this call on web request.
        let url = `/v2/guild/${serverConfig.guildId}/log`;
        let option: RequestOption = {
            authenticate: true,
            timeout: 15 * 1000
        };

        if (typeof (since) === "number") {
            option.qs = {since: since};
        }
        return await requestAsync(url, option);
    }

    public static async GetGuildRanksAsync(): Promise<ApiResponseData> {
        let url = `/v2/guild/${serverConfig.guildId}/ranks`;
        return await requestAsync(url, {authenticate: true});
    }

    public static async GetGuildMembersDataAsync(): Promise<Array<MemberData>> {
        let rankMap = GW2Api.ConvertDataToRankMap((await GW2Api.GetGuildRanksAsync()).data);
        let responseData = await GW2Api.GetGuildMembersAsync();
        return GW2Api.ConvertDataToMemberData(responseData.data, rankMap);
    }

    public static ConvertDataToRankMap(arrayData: Array<any>): any {
        let rankMap = {};
        arrayData.forEach((data) => {
            rankMap[data.id.toUpperCase()] = typeof(data.order) === "number" ? data.order : parseInt(data.order, 10);
        });
        return rankMap;
    }

    public static ConvertDataToMemberData(arrayData: Array<any>, rankMap: any): Array<MemberData> {
        let memberTracker = {};
        let result: Array<MemberData> = [];
        arrayData.forEach((data: any) => {
            if (data.name in memberTracker) {
                return;
            }
            memberTracker[data.name] = true;
            result.push({
                name: <string>data.name,
                rank: <number>rankMap[data.rank.toUpperCase()] || 9999,
                joined: new Date(Date.parse(data.joined))
            });
        });
        return result;
    }
}

export default GW2Api;
