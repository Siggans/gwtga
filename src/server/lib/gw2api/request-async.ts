import {ApiResponseData, RequestOption} from "./api-types";
import * as requestPromise from "request-promise-native";
import * as http from "http";

const config = require("../server-config").GetInstance();
import prequest = require("request-promise-native");

const ApiHost = "https://api.guildwars2.com/";

async function requestAsync(endPoint: string, options?: RequestOption): Promise<ApiResponseData> {

    return prequest(modifyOption({
            baseUrl: ApiHost,
            uri: endPoint,
            method: options.method || "GET",
            timeout: options.timeout || 10 * 1000,
            transform: (body, response: http.IncomingMessage): ApiResponseData => {
                let result: ApiResponseData = {
                    data: JSON.parse(body),
                    response: response,
                };
                let pagingCreated = false;
                let paging: any = {};
                if (response.headers) {
                    pagingCreated = addFieldHelper(response.headers, "X-Page-Size", paging, pagingCreated, "pageSize");
                    pagingCreated = addFieldHelper(response.headers, "X-Page-Total", paging, pagingCreated, "pageTotal");
                    pagingCreated = addFieldHelper(response.headers, "X-Result-Size", paging, pagingCreated, "itemsOnPage");
                    pagingCreated = addFieldHelper(response.headers, "X-Result-Total", paging, pagingCreated, "itemsTotal");
                    if (pagingCreated) {
                        result.paging = paging;
                    }
                }
                return result;
            },
            resolveWithFullResponse: true
        },
        options));

    function addFieldHelper(headers: any, headerField: string, option: any, modified: boolean, optionField?: string): boolean {
        let optsField = optionField || headerField;
        if (headerField in headers) {
            modified = true;
            option[optsField] = headers[headerField];
        }
        return modified;
    }
}

function modifyOption(requestOptions: requestPromise.Options, options: RequestOption) {
    // https://wiki.guildwars2.com/wiki/API:2

    if (!options) {
        console.log(JSON.stringify(requestOptions, null, 2));
        return requestOptions;
    }

    requestOptions.headers = Object.assign(requestOptions.headers || {}, options.headers || {});

    // Add API Key Bearer
    if (options.authenticate) {
        requestOptions.headers["Authorization"] = "Bearer " + config.guildApiKey;
    }

    requestOptions.qs = Object.assign(requestOptions.qs || {}, options.qs || {});

    // Paging
    if (options.paging) {
        if (!("qs" in requestOptions && (options.paging.page || options.paging.size))) {
            requestOptions.qs = {};
        }
        if (options.paging.page) {
            requestOptions.qs["page"] = options.paging.page;
        }
        if (options.paging.size) {
            requestOptions.qs["page_size"] = options.paging.size;
        }
    }

    // Localization
    requestOptions.headers["Accept-Language"] = "en";
    return requestOptions;
}

export = requestAsync;
