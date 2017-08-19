import path = require("path");
import fs = require("fs");

// Let's add type specification on __server_config
declare namespace NodeJS {
    export interface Global {
        __server_config: ServerConfig;
    }
}

// File location is <RootDir>/server/lib
const RootDir = path.join(__dirname, "../..");
const ConfigFile = path.join(RootDir, "server-config.json");

const ConfigFields = {
    COOKIE_SECRET: "cookie-secret",
    GUILD_API_KEY: "guild-api-key",
    GUILD_NAME: "guild-name",
    GUILD_ID: "guild-id",
    GUILD_TAG: "guild-tag",
    APP_NAME: "app-name",
    INITIAL_DATA: "initial-data"
};

export class ServerConfig {

    public static VerifyConfigExists(): boolean {
        return fs.existsSync(ConfigFile);
    }

    static GetInstance(): ServerConfig {
        if (!global.__server_config) {
            global.__server_config = new ServerConfig();
        }

        return global.__server_config;
    }

    constructor() {
        if (!ServerConfig.VerifyConfigExists()) {
            this._isValid = false;
        } else {
            this._readConfiguration();
        }
    }

    private _dbUrl: string;
    public get dbUrl(): string {
        return this._dbUrl;
    }

    private _cookieSecret: string;
    public get cookieSecret(): string {
        return this._cookieSecret;
    }

    private _guildApiKey: string;
    public get guildApiKey(): string {
        return this._guildApiKey;
    }

    private _guildId: string;
    public get guildId(): string {
        return this._guildId;
    }

    private _guildName: string;
    public get guildName(): string {
        return this._guildName;
    }

    private _guildTag: string;
    public get guildTag(): string {
        return this._guildTag;
    }

    private _appName: string;
    public get appName(): string {
        return this._appName;
    }

    private _environment: string;
    public get environment(): string {
        return this._environment;
    }

    private _isValid: boolean;
    public get isValid(): boolean {
        return this._isValid;
    }

    private _db_no_ssl: boolean;

    public get dbUseSSL(): boolean {
        return !this._db_no_ssl;
    }

    private _initial_data: Array<any>;

    public get initialData(): Array<any> {
        return this._initial_data;
    }

    private _readConfiguration() {
        let isValid = true;
        let serverConfig = require(ConfigFile);

        this._environment = process.env.APP_ENVIRONMENT;
        this._db_no_ssl = Boolean(process.env.DATABASE_NO_SSL);
        this._appName = getConfigValue(ConfigFields.APP_NAME);
        this._cookieSecret = getConfigValue(ConfigFields.COOKIE_SECRET);
        this._guildApiKey = getConfigValue(ConfigFields.GUILD_API_KEY);
        this._guildId = getConfigValue(ConfigFields.GUILD_ID);
        this._guildName = getConfigValue(ConfigFields.GUILD_NAME);
        this._guildTag = getConfigValue(ConfigFields.GUILD_TAG);
        this._dbUrl = process.env.DATABASE_URL;
        this._initial_data = serverConfig[ConfigFields.INITIAL_DATA] || [];

        this._isValid = isValid;

        function getConfigValue(fieldName: string): string {
            if (!(fieldName in serverConfig) || !serverConfig[fieldName]) {
                isValid = false;
                this.environment === "PRODUCTION" ? console.error("Cannot find " + fieldName) : console.log("Error: Cannot find" + fieldName);
                return "Invalid Value";
            }
            return serverConfig[fieldName];
        }
    }
}

export let serverConfig = ServerConfig.GetInstance();
export default serverConfig;
