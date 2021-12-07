import { readFileSync } from 'fs';
import axios from 'axios';

const { locale } = JSON.parse(readFileSync('./config.json'));

axios.defaults.baseURL = "https://apptoogoodtogo.com/api/";
axios.defaults.withCredentials = true;
axios.defaults.headers.common = {
  "user-agent": "TGTG/21.9.3 Dalvik/2.1.0 (Linux; U; Android 6.0.1; Nexus 5 Build/M4B30Z)",
  "accept-language": locale,
  "accept-encoding": "gzip;q=1.0, compress;q=0.5"
};

const itemEndpoint = "item/v7/";
const authByEmail = "auth/v3/authByEmail";
const signUpByEmail = "auth/v2/signUpByEmail";
const refreshTokenEndpoint = "auth/v3/token/refresh";
const authPollingEndpoint = "auth/v3/authByRequestPollingId";

export const loginByEmail = async (email) => {
  return axios.post(authByEmail, {
    "device_type": "ANDROID",
    "email": email,
  });
};

export const authPolling = (email, pollingId) => {
  return axios.post(authPollingEndpoint, {
    "device_type": "ANDROID",
    "email": email,
    "request_polling_id": pollingId,
  });
};

export const refreshToken = (accessToken, refreshToken) => {
  return axios.post(refreshTokenEndpoint, {
      refresh_token: refreshToken,
    },
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
};

export const getItems = (accessToken, userId, favorite = true) => {
  return axios.post(itemEndpoint, {
      favorites_only: favorite,
      origin: {
        latitude: 0.0,
        longitude: 0.0,
      },
      radius: 200,
      user_id: userId,
    },
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
};
