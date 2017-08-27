

import {
    AllowNull, AutoIncrement, BelongsToMany, Column, DataType, Default, ForeignKey, HasMany, HasOne, Model, PrimaryKey,
    Table, Unique
} from "sequelize-typescript";
import {Application} from "./Application";
import {Event} from "./Event";
import {OfficerNote} from "./OfficerNote";
import {Post} from "./Post";
import {Role} from "./Role";
import {unique} from "sequelize-typescript/lib/utils/array";

@Table({version: true})
export class User extends Model<User> {

    /// #region: database columns

    @PrimaryKey @AutoIncrement
    @Column public id: number;

    @AllowNull(false)
    @Column public gw2Account: string;

    @Column public hash: string; // hashed string key from bcrypt

    @Unique @AllowNull(true)
    @Column public oneTimeKey: string;

    @Column public oneTimeKeyExpire: Date;

    @AllowNull(false)
    @Column public guildRank: number;

    @Column public joined: Date;

    @Column public left: Date;

    @Column public googleId: string;
    @Column public googleAccountEmail: string;
    @Column public discordAccount: string;
    @Column public nickNames: string;

    @Default(false)
    @Column public isRegistered: boolean;

    @Column public isBanned: boolean;

    @Column public previousLeave: Date;
    @Default(0) @AllowNull(false)
    @Column public rejoinCount: number;

    /// #end region: database columns

    // application associations.
    @HasOne(() => Application, "userId")
    public Application: Application;

    // event associations.
    @HasMany(() => Event, "creatorId")
    public AuthoredEvents: Event[];

    @BelongsToMany(() => Event, "UserLeadEvent", "userId")
    public Events: Event[];

    // officer note associations
    @HasMany(() => OfficerNote, "creatorId")
    public AuthoredNotes: OfficerNote[];

    @HasMany(() => OfficerNote, "targetId")
    public TargetedNotes: OfficerNote[];

    // post association
    @HasMany(() => Post, "creatorId")
    public AuthoredPosts: Post[];

    @HasMany(() => Post, "modifierId")
    public ModifiedPosts: Post[];

    // role association
    @BelongsToMany(() => Role, "UserRole", "userId")
    public Roles: Role[];
}


