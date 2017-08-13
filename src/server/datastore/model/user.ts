import sequelize = require("sequelize");

import orm = require("datastore/orm-initialize");

const UserDefinition: sequelize.DefineAttributes = {
    // Primary Key
    id: {type: sequelize.INTEGER, autoIncrement: true},

    // Guild wars 2 account
    gw2Account: {type: sequelize.STRING(50), unique: true},

    // Guild Rank, automatically filled  from API
    guildRank: {type: sequelize.BOOLEAN, defaultValue: false, allowNull: false},

    // Guild Join Date, automatically filled from API
    joined: sequelize.DATEONLY,

    // google and discord account (google will be how we log user in)
    googleAccount: sequelize.STRING,
    discordAccount: sequelize.STRING,

    // user's preffered Nick name.
    nickName: sequelize.STRING,

    // Check if user is registered.
    registered: {type: sequelize.BOOLEAN, defaultValue: false, allowNull: false},

    // Check if this account has been automatically acquired
    isAutomated: {type: sequelize.BOOLEAN, defaultValue: false, allowNull: false},

    // Developer access, this is restricted to primary developer and collaborators.
    isDev: {type: sequelize.BOOLEAN, defaultValue: false, allowNull: false},

    // We should not invite this user back to guild under any circumstance.
    isBanned: {type: sequelize.BOOLEAN, defaultValue: false, allowNull: false},

    // For users that rejoined the guild.
    lastActive: {type: sequelize.RANGE(sequelize.DATEONLY)},

    rejoinCount: {type: sequelize.INTEGER, defaultValue: 0, allowNull: false},

    // Notes we want to keep on this user for admin purpose.
    officerNote: sequelize.STRING(2000)

};

export = orm.define("User", UserDefinition, {
    /* tslint:disable no-invalid-this */
    validate: {
        requiresAtLeastOneAccount(): boolean {
            return Boolean(this.gw2Account || this.googleAccount || this.discordAccount);
        }
    }
    /* tslint:enable no-invalid-this */
});
