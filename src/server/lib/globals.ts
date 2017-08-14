
declare namespace NodeJS {
    export interface Global {
        __server_config: any;
        __server_orm: any;
        __datastore_instance: any;
    }
}
