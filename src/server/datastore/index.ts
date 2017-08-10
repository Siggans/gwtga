
const config = require("lib/server-config").GetInstance();
const pg = require("pg");

// let's set the ssl requirement now.
pg.defaults.ssl = config.dbUseSSL;

class DataStore {
    constructor() {}
}

export = DataStore;
