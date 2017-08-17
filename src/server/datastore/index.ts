/// <references type="node" />

const orm = require("./orm-initialize");
const config = require("../lib/server-config").GetInstance();

/// import all model definitions.
import {Application} from "./model/Application";
import {Event} from "./model/Event";
import {Log} from "./model/Log";
import {OfficerNote} from "./model/OfficerNote";
import {Post} from "./model/Post";
import {Role} from "./model/Role";
import {User} from "./model/User";

declare namespace NodeJS {
    export interface Global {
        __datastore_instance: DataStore;
    }
}

interface DataStoreTable {
    applications: Application;
    events: Event;
    logs: Log;
    officerNotes: OfficerNote;
    posts: Post;
    roles: Role;
    users: User;
}

class DataStore {

    public get rawStore() {
        return orm;
    }

    public get isInitialized() {
        return this._isSynchronized;
    }

    public readonly tables = {
        applications: Application,
        events: Event,
        logs: Log,
        officerNotes: OfficerNote,
        posts: Post,
        roles: Role,
        users: User,
    };

    public async testConnectionAsync(): Promise<Boolean> {
        try {
            await this.rawStore.authenticate();
        } catch (err) {
            console.error("Unable to connect to database: ", err);
            return false;
        }
        return true;
    }

    private _isSynchronized = false;

    public async initializeAsync(): Promise<Boolean> {

        if (this.isInitialized) {
            return true;
        }

        if (!await this.testConnectionAsync()) {
            throw new Error("Connection failed to database...");
        }

        try {
            let opts = {
                force: false,
                logging: false
            };
            await this.rawStore.sync(opts);
        } catch (err) {
            console.error("Failed to synchronize: ", err);
            return false;
        }
        this._isSynchronized = true;
        return true;

    }
}

function getDatastoreInstance(): DataStore {
    global.__datastore_instance = global.__datastore_instance || new DataStore();
    return global.__datastore_instance;
}

export = getDatastoreInstance();
