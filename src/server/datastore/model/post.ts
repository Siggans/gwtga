import sequelize = require("sequelize");

import orm = require("../orm-initialize");

const PostDefinition: sequelize.DefineAttributes = {
    // Primary Key
    uuid: {type: sequelize.UUIDV4, primaryKey: true},

    // created date
    created: {type: sequelize.DATE, allowNull: false},

    // creator
    createdBy: {type: sequelize.NUMBER, allowNull: false},

    // modified date
    modified: {type: sequelize.DATE, allowNull: true},

    // modify user
    modifiedBy: {type: sequelize.NUMBER},

    // category of note
    category: {type: sequelize.STRING, allowNull: false},

    // title of note.
    title: {type: sequelize.STRING, allowNull: false},

    // content of the post
    content: {type: sequelize.STRING(5000), allowNull: false},

    // approval
    isApproved: sequelize.BOOLEAN,
};

export = orm.define("Post", PostDefinition);
