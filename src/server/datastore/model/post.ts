import sequelize = require("sequelize");

import orm = require("../orm-initialize");

const PostDefinition: sequelize.DefineAttributes = {
    // Primary Key
    uuid: {type: sequelize.UUIDV4, primaryKey: true},

    created: {type: sequelize.DATE, allowNull: false},

    createdBy: {type: sequelize.NUMBER, allowNull: false},

    modified: {type: sequelize.DATE, allowNull: true},

    modifiedBy: {type: sequelize.NUMBER},

    subject: {type: sequelize.STRING, allowNull: false},

    content: {type: sequelize.STRING(5000), allowNull: false}
};

export = orm.define("Post", PostDefinition);
