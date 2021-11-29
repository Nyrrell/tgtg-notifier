import axios from "axios";

axios.defaults.baseURL = "https://apptoogoodtogo.com/api/";
axios.defaults.withCredentials = true
axios.defaults.headers.common = {
  "accept": "application/json",
  "content-type": "application/json",
  "user-agent": "TGTG/21.9.3 Dalvik/2.1.0 (Linux; U; Android 6.0.1; Nexus 5 Build/M4B30Z)",
  "accept-language": "fr-FR",
  "accept-encoding": "gzip;q=1.0, compress;q=0.5 "
};

const itemEndpoint = "item/v7/"
const authByEmail = "auth/v3/authByEmail"
const signUpByEmail = "auth/v2/signUpByEmail"
const refreshTokenEndpoint = "auth/v3/token/refresh"

export const loginByEmail = async (email, password) => {
  return axios.post(authByEmail, {
    "device_type": "ANDROID",
    "email": email,
    //"password": password,
  });
}

export const refreshAccessToken = (accessToken, refreshToken) => {
  return axios.post(refreshTokenEndpoint, {
      refresh_token: refreshToken,
    },
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
}

export const getFavorites = (accessToken, userId) => {
  return axios.post(itemEndpoint, {
      favorites_only: true,
      origin: {
        latitude: 48.68778,
        longitude: 6.17672,
      },
      radius: 200,
      user_id: userId,
    },
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
}
