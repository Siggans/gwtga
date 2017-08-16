
import sequelize = require("sequelize");

import orm = require("../orm-initialize");

const OfficerNoteDefinition: sequelize.DefineAttributes = {
    // Primary Key
    uuid: {type: sequelize.UUIDV4, primaryKey: true},

    created: {type: sequelize.DATE, allowNull: false},

    createdBy: {type: sequelize.NUMBER, allowNull: false},

    // targeted member of the note.
    target: {type: sequelize.NUMBER, allowNull: false},

    // The short note from officer. 255 characters.
    message: {type: sequelize.STRING, allowNull: false}
};

export = orm.define("OfficerNote", OfficerNoteDefinition);
