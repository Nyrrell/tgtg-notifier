import Keyv from "keyv";

class Database {
  private database = new Keyv("sqlite://database.sqlite");

  set = (prefix: string, key: string, value: string) =>
    this.database.set(`${prefix}:${key}`, value);
  get = (prefix: string, key: string) => this.database.get(`${prefix}:${key}`);
}

export default new Database();
