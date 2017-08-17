/// <references path="node" />
import "globals";

const {URL} = require("url");

import {ISequelizeConfig, ISequelizeValidationOnlyConfig, Sequelize} from "sequelize-typescript";
import pg = require("pg");

const config = require("../lib/server-config").GetInstance();

declare namespace NodeJS {
    export interface Global {
        __server_orm: Sequelize;
    }
}

const databaseUrl = new URL(config.dbUrl);

pg.defaults.ssl = config.dbUseSSL; // let's set the ssl requirement now.
pg.defaults.parseInt8 = true; // enable big int (64 bits) parsing and return as int.

const opts: ISequelizeConfig = {
    name: databaseUrl.pathname.substr(1),
    username: databaseUrl.username,
    password: databaseUrl.password,
    port: databaseUrl.port,
    host: databaseUrl.hostname,
    dialect: "postgres",
    pool: {
        max: 10,  // max connection from plan is 20
        min: 0,
        idle: 20 * 1000
    },
    logging: false,
    validateOnly: false
};

function getOrmInstance(): Sequelize {

    if (!global.__server_orm) {
        try {
            global.__server_orm = new Sequelize(opts);
            global.__server_orm.addModels([require("path").join(__dirname, "model")]);
        } catch (err) {
            console.error(err);
            return null;
        }

    }

    return global.__server_orm;
}

export = getOrmInstance();
