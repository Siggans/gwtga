import "globals";

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
const EnvFile = path.join(RootDir, ".env");
const ConfigFile = path.join(RootDir, "server-config.json");

const ConfigFields = {
    LOCAL_DB_URL: "local-db-url",
    DB_USER: "db-user",
    DB_PW: "db-pw",
    COOKIE_SECRET: "cookie-secret",
    GUILD_API_KEY: "guild-api-key",
    GUILD_NAME: "guild-name",
    GUILD_ID: "guild-id",
    GUILD_TAG: "guild-tag",
    APP_NAME: "app-name"
};

class ServerConfig {

    static VerifyConfigExists(): boolean {
        return fs.existsSync(EnvFile) && fs.existsSync(ConfigFile);
    }

    static GetInstance(): ServerConfig {
        if (!global.__server_config) {
            global.__server_config = new ServerConfig();
        }

        return global.__server_config;
    }

    constructor() {
        if (!ServerConfig.VerifyConfigExists()) {
            throw new Error("Cannot read configurations");
        }
        this._readConfiguration();
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

    private _isValid: boolean = false;
    public get isValid(): boolean {
        return this._isValid;
    }

    private _readConfiguration() {
        let isValid = true;
        let serverConfig = require(ConfigFile);

        this._environment = process.env.APP_ENVIRONMENT;
        this._appName = getConfigValue(ConfigFields.APP_NAME);
        this._cookieSecret = getConfigValue(ConfigFields.COOKIE_SECRET);
        this._guildApiKey = getConfigValue(ConfigFields.GUILD_API_KEY);
        this._guildId = getConfigValue(ConfigFields.GUILD_ID);
        this._guildName = getConfigValue(ConfigFields.GUILD_NAME);
        this._guildTag = getConfigValue(ConfigFields.GUILD_TAG);
        this._dbUrl = ("DATABASE_URL" in process.env) ? process.env.DATABASE_URL : getConfigValue(ConfigFields.LOCAL_DB_URL);

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

export = ServerConfig;
