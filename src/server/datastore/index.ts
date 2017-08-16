/// <references type="node" />

const orm = require("./orm-initialize");
const User = require("./model/user");
const Post = require("./model/post");
const Event = require("./model/event");
const Log = require("./model/log");
const OfficerNote = require("./model/officer-note");
const Application = require("./model/application");

declare namespace NodeJS {
    export interface Global {
        __datastore_instance: DataStore;
    }
}

function applyAssociations() {
    // quick note: has applies foreign key to other mode.  belongsTo applies foreign key to self.

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
}

class DataStore {

    public get isInitialized() {
        return this._isSynchronized;
    }

    public get model() {
        if (!this.isInitialized) {
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

        if (this.isInitialized) {
            return true;
        }

        await this.testConnectionAsync();

        applyAssociations();

        // User and application (0 - 1):  User can have one application, Application belongs to one user.
        User.hasOne(Application, {as: "Application", foreignKey: "userId"});
        Application.belongsTo(User, {as: "ForUser", foreignKey: "userId"});

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
