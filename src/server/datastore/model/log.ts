import sequelize = require("sequelize");

import orm = require("../orm-initialize");

const LogDefinition: sequelize.DefineAttributes = {
    // Primary Key
    uuid: {type: sequelize.UUIDV4, primaryKey: true},

    time: {type: sequelize.DATE, allowNull: false},

    duration: {type: sequelize.INTEGER, defaultValue: 30, allowNull: false},

    jsonString: {type: sequelize.STRING(2000), allowNull: false}
};

export = orm.define("Log", LogDefinition);
