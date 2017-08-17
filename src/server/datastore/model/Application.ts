import {User} from "./User";
import {
    AllowNull, AutoIncrement, BelongsTo, Column, DataType, Default, ForeignKey, Length, Model, PrimaryKey, Table, Unique
} from "sequelize-typescript";

@Table({version: true})
export class Application extends Model<Application> {

    /// #region:  Database Columns

    @PrimaryKey @AutoIncrement @AllowNull(false)
    @Column public id: number;

    // Guild wars 2 account
    @AllowNull(false) @Unique
    @Column(DataType.STRING(50)) public gw2Account: string;

    @AllowNull(false)
    @Column(DataType.STRING(15)) public server: string;

    // google and discord account (google will be how we log user in)
    @Column public googleAccount: string;
    @Column public discordAccount: string;

    // user's preferred Nick name.
    @Column public nickName: string;

    // user's preferred area.
    @Column public pvp: boolean;
    @Column public pve: boolean;
    @Column public wvw: boolean;
    @Column public raid: boolean;

    // short description of the goal wanting out of the guild/
    @Column public goal: string;

    // notice for time available.  Officer should convert this to note attached to user.
    @AllowNull(false) @Length({min: 3})
    @Column public availableTimeNote: string;

    @AllowNull(false) @Length({min: 3})
    @Column public professions: string;

    @Default(true)
    @Column public hasLvl80: boolean;

    // key for finding the correct account
    @Column public userId: number;

    /// #end region: Database Columns

    // Application belongs to 0-1 user.
    @BelongsTo(() => User, {foreignKey: {name: "userId", allowNull: true}})
    public ForUser: User;
}

