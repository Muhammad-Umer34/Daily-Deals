// Keeps a logged-in shopper logged in.
//
// The access token lasts 30 minutes; the httpOnly refresh cookie lasts 7 days.
// When the access token has run out, one call to /api/auth/refresh (with the
// cookie) gets a new one. Only when that fails is the shopper really logged out.
import axios from "axios";
import appStore from "../../store";
import { authActions, tokenExpired } from "./authSlices";

const REFRESH_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/refresh`;

let inFlight = null;

/** Get a new access token from the refresh cookie. Resolves to the token, or null after logging out. */
export function refreshSession() {
  if (!inFlight) {
    inFlight = axios
      // _noRefresh: this request must never trigger the retry interceptor itself.
      .post(REFRESH_URL, {}, { withCredentials: true, _noRefresh: true })
      .then((response) => {
        appStore.dispatch(authActions.setAccessToken(response.data.accessToken));
        return response.data.accessToken;
      })
      .catch((error) => {
        // Only a refused cookie ends the session; a network blip must not log anyone out.
        const status = error.response?.status;
        if (status === 401 || status === 403) appStore.dispatch(authActions.logout());
        return null;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/**
 * The current access token, renewed first if it's about to expire.
 * Null for guests and for sessions that could not be renewed.
 */
export async function freshAccessToken() {
  const { user, accessToken } = appStore.getState().auth;
  if (!user || !accessToken) return null;
  if (!tokenExpired(accessToken, 60_000)) return accessToken;
  return refreshSession();
}
