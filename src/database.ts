import KeyvSqlite from '@keyv/sqlite';
import Keyv from 'keyv';

class Database {
  private database = new Keyv(new KeyvSqlite('sqlite://database.sqlite'), { ttl: 10000 * 60 });

  get getInstance(): Keyv<any> {
    return this.database;
  }

  set = (prefix: string, key: string, value: number, ttl?: number) => this.database.set(`${prefix}:${key}`, value, ttl);
  get = (prefix: string, key: string) => this.database.get(`${prefix}:${key}`);
}

export default new Database();
