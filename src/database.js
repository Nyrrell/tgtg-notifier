import Keyv from "@keyvhq/core";
import KeyvSqlite from "@keyvhq/sqlite";

class Database {
  #database = new Keyv({ store: new KeyvSqlite({ uri: 'sqlite://database.sqlite' }) });

  set = (prefix, key, value) => this.#database.set(`${prefix}:${key}`, value);

  get = (prefix, key) => this.#database.get(`${prefix}:${key}`)
}

export default new Database();