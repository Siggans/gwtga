import {AllowNull, Column, DataType, Model, PrimaryKey, Table} from "sequelize-typescript";

@Table
export class Log extends Model<Log> {

    @PrimaryKey // we get the id from guild wars 2 api directly.
    @Column public id: number;

    @AllowNull(false)
    @Column public type: string;

    @AllowNull(false)
    @Column(DataType.TEXT) public jsonString: string;
}

