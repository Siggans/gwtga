/// <references path="../globals" />

import {serverConfig} from "../lib/server-config";
import {ISequelizeConfig, ISequelizeValidationOnlyConfig, Sequelize} from "sequelize-typescript";
import pg = require("pg");

const {URL} = require("url");

declare namespace NodeJS {
    export interface Global {
        __server_orm: Sequelize;
    }
}

const databaseUrl = new URL(serverConfig.dbUrl);

pg.defaults.ssl = serverConfig.dbUseSSL; // let's set the ssl requirement now.
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

export function getOrmInstance(): Sequelize {

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

export default getOrmInstance;
