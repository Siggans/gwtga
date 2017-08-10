import "globals";
declare class ServerConfig {
    static VerifyConfigExists(): boolean;
    static GetInstance(): ServerConfig;
    constructor();
    private _dbUrl;
    readonly dbUrl: string;
    private _cookieSecret;
    readonly cookieSecret: string;
    private _guildApiKey;
    readonly guildApiKey: string;
    private _guildId;
    readonly guildId: string;
    private _guildName;
    readonly guildName: string;
    private _guildTag;
    readonly guildTag: string;
    private _appName;
    readonly appName: string;
    private _environment;
    readonly environment: string;
    private _isValid;
    readonly isValid: boolean;
    private _readConfiguration();
}
export = ServerConfig;
