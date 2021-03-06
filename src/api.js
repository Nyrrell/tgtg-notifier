import axios from 'axios';

import { COOKIE, LOCALE } from "./config.js";

const USER_AGENT = [
  "TGTG/21.12.1 Dalvik/2.1.0 (Linux; U; Android 6.0.1; Nexus 5 Build/M4B30Z)",
  "TGTG/21.12.1 Dalvik/2.1.0 (Linux; U; Android 7.0; SM-G935F Build/NRD90M)",
  "TGTG/21.12.1 Dalvik/2.1.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K)",
  "TGTG/22.2.1 Dalvik/2.1.0 (Linux; U; Android 9; SM-G955F Build/PPR1.180610.011)"
];

const TGTG = axios.create({
  baseURL: "https://apptoogoodtogo.com/api/",
  withCredentials: true,
  headers: {
    "user-agent": USER_AGENT[Math.floor(Math.random() * USER_AGENT.length)],
    "accept-encoding": "gzip;q=1.0, compress;q=0.5",
    "accept-language": LOCALE,
    "cookie": COOKIE,
  }
});

const endpoint = {
  item: "item/v7/",
  authByEmail: "auth/v3/authByEmail",
  signUpByEmail: "auth/v3/signUpByEmail",
  refreshToken: "auth/v3/token/refresh",
  authPolling: "auth/v3/authByRequestPollingId"
};

const loginByEmail = async (email) => TGTG.post(endpoint['authByEmail'], {
  "device_type": "ANDROID",
  "email": email,
});

const authPolling = (email, pollingId) => TGTG.post(endpoint['authPolling'], {
  "device_type": "ANDROID",
  "email": email,
  "request_polling_id": pollingId,
});

const refreshToken = (accessToken, refreshToken) => TGTG.post(endpoint['refreshToken'], {
    refresh_token: refreshToken,
  },
  {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

const getItems = (accessToken, userId, favorite = true) => TGTG.post(endpoint['item'], {
    favorites_only: favorite,
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
  });

export default {
  loginByEmail,
  refreshToken,
  authPolling,
  getItems
};
