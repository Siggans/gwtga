import {User} from "./User";
import {
    AllowNull, BelongsTo, Column, CreatedAt, DataType, Default, ForeignKey, Model, PrimaryKey, Table
} from "sequelize-typescript";

@Table({version: true})
export class Post extends Model<Post> {

    /// #region: Database Columns
    @PrimaryKey @Default(DataType.UUIDV4)
    @Column(DataType.UUID) public uuid: string;

    @CreatedAt public created: Date;

    @Column(DataType.DATE) public modified: Date; // only used after it is approved

    @Column public isApproved: boolean;

    @Column public category: string;

    @AllowNull(false)
    @Column public title: string;

    @Column(DataType.STRING(5000)) public content: string;

    // foreign keys

    @Column public creatorId: number;

    @Column public modifierId: number;

    /// #end region: Database Columns

    @BelongsTo(() => User, "creatorId")
    public CreatedBy: User;

    // may not have a modifier
    @BelongsTo(() => User, {foreignKey: {name: "modifierId", allowNull: true}})
    public ModifiedBy: User;
}
