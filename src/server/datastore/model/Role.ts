import {User} from "./User";
import {
    AllowNull, AutoIncrement, BelongsToMany, Column, Default, Model, PrimaryKey, Table, Unique
} from "sequelize-typescript";

@Table({version: true})
export class Role extends Model<Role> {

    @PrimaryKey @AutoIncrement
    @Column public id: number;

    @Unique @AllowNull(false)
    @Column role: string;

    @AllowNull(false) @Default(9999)
    @Column
    public get rank(): number {
        return this.getDataValue("rank") as number;
    }

    public set rank(i: number) { // when set directly,  the weight can only be positive numbers.
        let n = Math.floor(i);
        n = Math.max(n, 1);
        this.setDataValue("rank", n);
    }

    @BelongsToMany(() => User, "UserRole", "roleId")
    public Members: User[];
}

