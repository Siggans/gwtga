import sequelize = require("sequelize");

import orm = require("../orm-initialize");

const RoleDefinition: sequelize.DefineAttributes = {
    // Primary Key
    id: {type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},

    // Name of the role
    role: {
        type: sequelize.STRING(10),
        allowNull: false,
        unique: true,
        set (s: string) {
            // this is bound by sequelize.
            // tslint:disable-next-line no-invalid-this
            this.setDataValue("role", s.toUpperCase());
        }
    },

    // lower rank value is more important in position.
    rank: {
        type: sequelize.INTEGER,
        allowNull: false,
        defaultValue: 9999,
        set (i: number) {
            let ii = Math.floor(i);
            ii = Math.max(ii, 1); // ii >=1

            // this is bound by sequelize.
            // tslint:disable-next-line no-invalid-this
            this.setDataValue("rank", ii);
        }
    }
};

export = orm.define("Role", RoleDefinition);
