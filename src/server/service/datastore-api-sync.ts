import GW2Api from "../lib/gw2api/index";
import {ApiResponseData, MemberData} from "../lib/gw2api/api-types";

export class DatastoreApiSync {

    public static async syncAllMembersAsync(): Promise<boolean> {
        return await syncAllMembersAsyncImpl(5);
    }

}

async function syncAllMembersAsyncImpl(retry: number): Promise<boolean> {
    throw new Error("Not Implemented");
}

export default DatastoreApiSync;
