declare class ServerConfig {
    static VerifyConfigExists(): boolean;
    static GetInstance(): ServerConfig;
    constructor();
    private _readConfiguration();
    private _isValid;
    readonly isValid: boolean;
}
export = ServerConfig;
