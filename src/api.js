import _axios from 'axios';

import { LOCALE } from "./config.js";

const axios = _axios.create({
  baseURL: "https://apptoogoodtogo.com/api/",
  withCredentials: true,
  headers: {
    "user-agent": "TGTG/21.9.3 Dalvik/2.1.0 (Linux; U; Android 6.0.1; Nexus 5 Build/M4B30Z)",
    "accept-encoding": "gzip;q=1.0, compress;q=0.5",
    "accept-language": LOCALE
  }
});

const itemEndpoint = "item/v7/";
const authByEmail = "auth/v3/authByEmail";
const signUpByEmail = "auth/v3/signUpByEmail";
const refreshTokenEndpoint = "auth/v3/token/refresh";
const authPollingEndpoint = "auth/v3/authByRequestPollingId";

const loginByEmail = async (email) => {
  return axios.post(authByEmail, {
    "device_type": "ANDROID",
    "email": email,
  });
};

const authPolling = (email, pollingId) => {
  return axios.post(authPollingEndpoint, {
    "device_type": "ANDROID",
    "email": email,
    "request_polling_id": pollingId,
  });
};

const refreshToken = (accessToken, refreshToken) => {
  return axios.post(refreshTokenEndpoint, {
      refresh_token: refreshToken,
    },
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
};

const getItems = (accessToken, userId, favorite = true) => {
  return axios.post(itemEndpoint, {
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
};

export default {
  loginByEmail,
  authPolling,
  refreshToken,
  getItems
}
