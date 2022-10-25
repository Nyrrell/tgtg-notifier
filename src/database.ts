import Keyv from "@keyvhq/core";
import KeyvSqlite from "@keyvhq/sqlite";

class Database {
    private database = new Keyv({ store: new KeyvSqlite({ uri: 'sqlite://database.sqlite' }) });

    set = (prefix: string, key: string, value: string) => this.database.set(`${prefix}:${key}`, value);
    get = (prefix: string, key: string) => this.database.get(`${prefix}:${key}`)
}

export default new Database();