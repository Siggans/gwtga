import {ApiResponseData, RequestOption} from "./api-types";

const requestAsync = require("request-async");
const config = require("../server-config").GetInstance();
const guildId = config.guildId;

class GW2Api {

    public static async GetGuildMembersAsync(pageNumber?: number, pageSize?: number): Promise<ApiResponseData> {
        let url = `/v2/guild/${config.guildId}/members`;
        let option: RequestOption = {
            authenticate: true,
        };
        if (typeof(pageSize) === "number" || typeof(pageNumber) === "number") {
            option.paging = {};
            if (pageNumber !== 0) { // this number must exist if test valid.  pageSize is 2nd option and can be missing.
                option.paging.page = pageNumber;
            }
            if (typeof(pageSize) === "number" && pageSize > 0) {
                option.paging.size = pageSize;
            }
        }
        return await requestAsync(url, {authenticate: true});
    }

    public static async GetGuildLogAsync(options?: { lastId?: number; pageNumber?: number; pageSize?: number }): Promise<ApiResponseData> {
        let url = `/v2/guild/${config.guildId}/members`;
        let option: RequestOption = {
            authenticate: true,
        };
        if (options) {
            if ("lastId" in options) {
                option.qs = {since: options.lastId};
            }
            if ("pageSize" in options || "pageNumber" in options) {
                option.paging = {};
                if ("pageNumber" in options && options.pageNumber >= 0) {
                    option.paging.page = options.pageNumber;
                }
                if ("pageSize" in options && options.pageSize > 0) {
                    option.paging.size = options.pageSize;
                }
            }
        }
        throw new Error("NotImplemented");
    }

    public static async GetGuildRanksAsync(): Promise<ApiResponseData> {
        let url = `/v2/guild/${config.guildId}/ranks`;
        return await requestAsync(url, {authenticate: true});
    }
}

export = GW2Api;
