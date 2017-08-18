/// <references path="../globals" />

import {getOrmInstance} from "./orm-initialize";

/// import all model definitions.
import {Application} from "./model/Application";
import {Event} from "./model/Event";
import {Log} from "./model/Log";
import {OfficerNote} from "./model/OfficerNote";
import {Post} from "./model/Post";
import {Role} from "./model/Role";
import {User} from "./model/User";
import {Model, Sequelize} from "sequelize-typescript";

declare namespace NodeJS {
    export interface Global {
        __datastore_instance: DataStore;
    }
}

class DataStoreTable {
    public Applications = Application;
    public Event = Event;
    public Logs = Log;
    public OfficerNotes = OfficerNote;
    public Posts = Post;
    public Roles = Role;
    public Users = User;
}

export class DataStore {

    constructor() {
        this._orm = getOrmInstance();
        this._table = new DataStoreTable();
    }

    private _orm: Sequelize;

    public get rawStore() {
        return this._orm;
    }

    public get isInitialized() {
        return this._isSynchronized;
    }

    private _table: DataStoreTable;
    public get table() {
        if (!this.isInitialized) {
            return null;
        }
        return this._table;
    }

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

    public async initializeAsync(): Promise<boolean> {

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

export function getDatastoreInstance(): DataStore {
    global.__datastore_instance = global.__datastore_instance || new DataStore();
    return global.__datastore_instance;
}

export let datastore = getDatastoreInstance();
export default datastore;
