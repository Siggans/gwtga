import sequelize = require("sequelize");

import orm = require("../orm-initialize");

const EventDefinition: sequelize.DefineAttributes = {
    // Primary Key
    uuid: {type: sequelize.UUIDV4, primaryKey: true},

    created: {type: sequelize.DATE, allowNull: false},

    scheduledTIme: {type: sequelize.DATE, allowNull: false},

    duration: {type: sequelize.INTEGER, defaultValue: 30, allowNull: false},

    cratedBy: {type: sequelize.STRING, allowNull: false},

    eventDescription: {type: sequelize.STRING(2000)}
};

export = orm.define("Event", EventDefinition);
