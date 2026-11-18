import axios from "axios";
import { freshAccessToken, refreshSession } from "../auth/session";

const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/assistant`;

/**
 * Every assistant call goes out with a current login token. The server treats an
 * expired token as "renew and resend" (sessionExpired) rather than quietly
 * showing a logged-in shopper the guest experience; if renewal fails the shopper
 * is logged out and the call is sent once more as a guest.
 */
const call = async (request) => {
  const send = (token) => request(token ? { Authorization: `Bearer ${token}` } : {}).then((r) => r.data);
  const data = await send(await freshAccessToken());
  if (!data?.sessionExpired) return data;
  return send(await refreshSession());
};

/** Send one shopper message. Login is optional: searching works logged out. */
export const sendAssistantMessage = ({ conversationId, message }) =>
  call((headers) => axios.post(`${BASE_URL}/chat`, { conversationId, message }, { headers }));

/**
 * Attach an anonymous conversation to the account after login and replay
 * whatever the shopper was blocked on.
 */
export const claimAssistantConversation = ({ conversationId }) =>
  call((headers) => axios.post(`${BASE_URL}/claim`, { conversationId }, { headers }));

/**
 * Exchange a confirmation token for a real order. Only ever called from the
 * Confirm order button on the summary card.
 *
 * Refusals come back as HTTP 200 with `ok: false` and a message to show.
 */
export const confirmAssistantOrder = ({ conversationId, token }) =>
  call((headers) => axios.post(`${BASE_URL}/confirm-order`, { conversationId, token }, { headers }));

/** Restore a conversation after a page refresh. Returns null when it's gone. */
export const loadAssistantConversation = async ({ conversationId }) => {
  try {
    return await call((headers) => axios.get(`${BASE_URL}/conversation/${conversationId}`, { headers }));
  } catch (error) {
    // 404 just means "expired or never existed" — start fresh, don't shout.
    if (error.response?.status === 404) return null;
    throw error;
  }
};
