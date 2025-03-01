import { ACCOUNTS } from '../src/config.js';
import { Client } from '../src/client.js';
import database from '../src/database.js';

const [account] = ACCOUNTS;
const client = new Client(account);

const noAccount = { email: '', accessToken: '', refreshToken: '', notifiers: [] };

const getDbSize = async () => {
  const values = [];
  if (database.getInstance?.iterator) {
    for await (const value of database.getInstance.iterator({})) {
      values.push(value);
    }
  }
  return values.length;
};

test('Account not filled must failed', () => {
  return expect(new Client(noAccount)['accountIsFilled']()).toBe(false);
});

test('Login with unregister email must failed', async () => {
  noAccount.email = Math.random().toString(36).slice(2).concat('@domain.com');
  await expect(new Client(noAccount)['loginByEmail']()).resolves.toBe(false);
});

test(
  'Login by email',
  async () => {
    return expect(client['loginByEmail']()).resolves.toBe(true);
  },
  5000 * 25
);

test('Get item', async () => {
  await database.getInstance.clear();
  await client['getItems'](false);
  expect(await getDbSize()).toBeGreaterThan(0);
});

test('Refresh token', async () => {
  const oldToken = client.credentials.accessToken;
  await client['refreshAccessToken']();
  expect(oldToken).not.toBe(client.credentials.accessToken);
});
