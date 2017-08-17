import {User} from "./User";
import {
    AllowNull, AutoIncrement, BelongsTo, Column, CreatedAt, DataType, Default, ForeignKey, Length, Model, PrimaryKey,
    Table,
    Unique
} from "sequelize-typescript";

@Table
export class OfficerNote extends Model<OfficerNote> {

    // #region:  Database Columns
    @PrimaryKey @Default(DataType.UUIDV4)
    @Column(DataType.UUID) public uuid: string;

    @CreatedAt public created: Date;

    @Column public message: string; // up to 255 chars.

    @Default(0)
    @Column(DataType.INTEGER) public type: number; // type of message.

    // foreign keys.

    @Column public creatorId: number;
    @Column public targetId: number;

    // #end region:  Database Columns

    // must have creator
    @BelongsTo(() => User, "creatorId")
    public CreatedBy: User;

    // may not need to target a user.
    @BelongsTo(() => User, {foreignKey: {name: "targetId", allowNull: true}})
    public TargetUser: User;
}

