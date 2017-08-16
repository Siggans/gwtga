import sequelize = require("sequelize");

import orm = require("../orm-initialize");

const ApplicationDefinition: sequelize.DefineAttributes = {
    // Primary Key
    id: {type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},

    // member foreign key if it can be associated.
    userId: {type: sequelize.INTEGER, allowNull: true},

    // Guild wars 2 account
    gw2Account: {type: sequelize.STRING(50), unique: true, allowNull: false},

    server: {type: sequelize.STRING(15), allowNull: false},

    // google and discord account (google will be how we log user in)
    googleAccount: sequelize.STRING,
    discordAccount: sequelize.STRING,

    // user's preferred Nick name.
    nickName: sequelize.STRING,

    // content area preferences.
    pvp: sequelize.BOOLEAN,
    pve: sequelize.BOOLEAN,
    raid: sequelize.BOOLEAN,
    wvw: sequelize.BOOLEAN,

    // short descript of the goal wanting out of the guild/
    goal: sequelize.STRING,

    // notice for time available.  Officer should convert this to note attached to user.
    timeNote: sequelize.STRING(500),

    // descriptions of the main  professions that user is used to.
    mainProfessions: sequelize.STRING,
};

export = orm.define("Application", ApplicationDefinition);
