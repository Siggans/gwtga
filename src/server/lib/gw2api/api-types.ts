import * as http from "http";

export interface RequestOption {
    method?: string;
    timeout?: number;
    authenticate?: boolean;
    paging?: {
        size?: number; // Size between ~50 to 200
        page?: number; // page desired.
    };
    qs?: any;
    headers?: any;
}

export interface ApiResponseData {
    data: any;
    response: http.IncomingMessage;
    paging?: {
        pageSize?: number,
        pageTotal?: number,
        itemsOnPage?: number,
        itemsTotal?: number
    };
}

export interface MemberData {
    name: string;
    rank: number;
    joined: Date;
}
