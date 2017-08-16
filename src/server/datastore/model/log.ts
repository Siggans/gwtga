import sequelize = require("sequelize");

import orm = require("../orm-initialize");

// Info and type of log that can be retrieved from GW2: https://wiki.guildwars2.com/wiki/API:2/guild/:id/log
const LogDefinition: sequelize.DefineAttributes = {

    // Primary Key, this is retrieved from  the log itself. DO NOT AUTO=GENERATE.
    id: {type: sequelize.BIGINT, primaryKey: true, autoIncrement: false},

    // type of the log
    type: sequelize.STRING(15),

    // raw json data of the log.
    jsonString: {type: sequelize.STRING(2000), allowNull: false}
};

export = orm.define("Log", LogDefinition);
