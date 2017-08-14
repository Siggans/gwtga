/// <references type="node" />

import orm = require("./orm-initialize");
import User = require("./model/user");
import Post = require("./model/post");
import Event = require("./model/event");
import Log = require("./model/log");
import OfficerNote = require("./model/officer-note");

declare namespace NodeJS {
    export interface Global {
        __datastore_instance: DataStore;
    }
}

class DataStore {

    public get isInitiaized() {
        return this._isSynchronized;
    }

    public get model() {
        if (!this._isSynchronized) {
            throw new Error("Model not initialzed");
        }
        return {
            User: User,
            Post: Post,
            OfficerNote: OfficerNote,
            Event: Event,
            Log: Log
        };
    }

    public async testConnectionAsync(): Promise<Boolean> {
        try {
            await orm.authenticate();
        } catch (err) {
            console.error("Unable to connect to database: ", err);
            return false;
        }
        return true;
    }

    private _isSynchronized = false;

    public async synchronizModelAsync(): Promise<Boolean> {

        if (this._isSynchronized) {
            return true;
        }

        await this.testConnectionAsync();

        // User and Event (many - many) User can attend many events, Event can have multiple attendees.
        User.belongsToMany(Event, {as: "AttendedEvents", through: "UserAttendEvent", foreignKey: "userId"});
        Event.belongsToMany(User, {as: "Attendees", through: "UserAttendEvent", foreignKey: "eventId"});

        // User and Event (many - many) User can lead several event, Event can have several leaders.
        User.belongsToMany(Event, {as: "LeadingEvents", through: "UserLeadEvent", foreignKey: "userId"});
        Event.belongsToMany(User, {as: "Leaders", through: "UserLeadEvent", foreignKey: "eventId"});

        // User and Post (1 - many) can create many posts. Post belongs to one creator.
        User.hasMany(Post, {as: "Postings", foreignKey: "createdBy"});
        Post.belongsTo(User, {as: "CreatedByUser", foreignKey: "createdBy"});

        // User and Post (1 - many) can modify many posts. Post has one last modifieded By.
        User.hasMany(Post, {as: "ModifiedPostings", foreignKey: "modifiedBy"}); // can be null.
        Post.belongsTo(User, {as: "ModifiedByUser", foreignKey: "modifiedBy"});

        // User and Officer Note (1 - many): User can create many officer note. OfficerNote has one creator.
        User.hasMany(OfficerNote, {as: "AuthoredOfficerNotes", foreignKey: "createdBy"});
        OfficerNote.belongsTo(User, {as: "CreatedByUser", foreignKey: "createdBy"});

        // User and Officer Note (1 - many): User can have several notes,  OfficerNote has one target.
        User.hasMany(OfficerNote, {as: "OfficerNotes", foreignKey: "target"});
        OfficerNote.belongsTo(User, {as: "ForUser", foreignKey: "target"});

        try {
            await orm.sync();
        } catch (err) {
            console.error("Failed to synchronize: ", err);
            return false;
        }
        this._isSynchronized = true;
        return true;
    }
}

global.__datastore_instance = global.__datastore_instance || new DataStore();
export = (global.__datastore_instance);
