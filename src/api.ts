import axios from "axios";

const USER_AGENT = [
  "TGTG/21.12.1 Dalvik/2.1.0 (Linux; U; Android 6.0.1; Nexus 5 Build/M4B30Z)",
  "TGTG/21.12.1 Dalvik/2.1.0 (Linux; U; Android 7.0; SM-G935F Build/NRD90M)",
  "TGTG/21.12.1 Dalvik/2.1.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K)",
  "TGTG/22.2.1 Dalvik/2.1.0 (Linux; U; Android 9; SM-G955F Build/PPR1.180610.011)",
];

const TGTG = axios.create({
  baseURL: "https://apptoogoodtogo.com/api/",
  withCredentials: true,
  headers: {
    "user-agent": USER_AGENT[Math.floor(Math.random() * USER_AGENT.length)],
    "accept-encoding": "gzip",
    "accept-language": "LOCALE",
  },
});

enum ENDPOINT {
  ITEM = "item/v7/",
  AUTH_BY_EMAIL = "auth/v3/authByEmail",
  REFRESH_TOKEN = "auth/v3/token/refresh",
  AUTH_POLLING = "auth/v3/authByRequestPollingId",
}

const loginByEmail = async (email: string) =>
  TGTG.post(ENDPOINT.AUTH_BY_EMAIL, {
    device_type: "ANDROID",
    email: email,
  });

const authPolling = (email: string, pollingId: string) =>
  TGTG.post(ENDPOINT.AUTH_POLLING, {
    device_type: "ANDROID",
    email: email,
    request_polling_id: pollingId,
  });

const refreshToken = (accessToken: string, refreshToken: string) =>
  TGTG.post(
    ENDPOINT.REFRESH_TOKEN,
    {
      refresh_token: refreshToken,
    },
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }
  );

const getItems = (
  accessToken: string,
  userId: string,
  withStock: boolean = true,
  favorite: boolean = true
) =>
  TGTG.post(
    ENDPOINT.ITEM,
    {
      favorites_only: favorite,
      with_stock_only: withStock,
      origin: {
        latitude: 0.0,
        longitude: 0.0,
      },
      radius: 20,
      user_id: userId,
    },
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }
  );

const setCookie = (cookie: string[]) =>
  (TGTG.defaults.headers.common["cookie"] = cookie);

export default {
  loginByEmail,
  refreshToken,
  authPolling,
  getItems,
  setCookie,
};
