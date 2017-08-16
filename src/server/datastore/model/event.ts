import sequelize = require("sequelize");

import orm = require("../orm-initialize");

const EventDefinition: sequelize.DefineAttributes = {
    // Primary Key
    uuid: {type: sequelize.UUIDV4, primaryKey: true},

    // date created
    created: {type: sequelize.DATE, allowNull: false},

    // creator
    cratedBy: {type: sequelize.STRING, allowNull: false},

    // time scheduled.
    scheduledTIme: {type: sequelize.DATE, allowNull: false},

    // running time.  30 minute default, 0 for any.
    duration: {type: sequelize.INTEGER, defaultValue: 30, allowNull: false},

    // description of the event.
    eventDescription: {type: sequelize.STRING(2000)},

    // approval by officer.
    isApproved: sequelize.BOOLEAN
};

export = orm.define("Event", EventDefinition);
