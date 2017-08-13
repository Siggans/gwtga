import "globals";

import Sequelize = require("sequelize");
import pg = require("pg");

const config = require("../lib/server-config").GetInstance();

declare namespace NodeJS {
    export interface Global {
        __server_orm: Sequelize.Sequelize;
    }
}

pg.defaults.ssl = config.dbUseSSL; // let's set the ssl requirement now.
pg.defaults.parseInt8 = true; // enable big int (64 bits) parsing and return as int.

const SequelizeOpts: Sequelize.Options = {
    dialect: "postgres",
    pool: {
        max: 10,  // max connection from plan is 20
        min: 0,
        idle: 20 * 1000
    }
};

function getOrmInstance(): Sequelize.Sequelize {
    if (!global.__server_orm) {
        global.__server_orm = new Sequelize(config.dbUrl, SequelizeOpts);
    }
    return global.__server_orm;
}

export = getOrmInstance();
