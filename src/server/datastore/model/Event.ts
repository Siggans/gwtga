import {User} from "./User";
import {
    AllowNull, BelongsTo, BelongsToMany, Column, CreatedAt, DataType, Default, ForeignKey, Model, PrimaryKey, Table
} from "sequelize-typescript";

@Table({version: true})
export class Event extends Model<Event> {
    // #region:  Database Columns

    @PrimaryKey @Default(DataType.UUIDV4)
    @Column(DataType.UUID) public uuid: string;

    @CreatedAt public created: Date;

    @Column public scheduledTime: Date;

    @Column public durationInMinutes: number;

    @Column(DataType.STRING(5000)) public eventDescription: string;

    // foreign keys

    @Column public creatorId: number;

    // #end region:  Database Columns

    @BelongsTo(() => User, "creatorId")
    public CreatedBy: User;

    @BelongsToMany(() => User, "UserLeadEvent", "eventId")
    public Leaders: User[];
}
