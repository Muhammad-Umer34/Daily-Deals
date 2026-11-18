import { createSlice } from "@reduxjs/toolkit";
import { authActions } from "../auth/authSlices";

// A conversation id is generated once per chat and kept in the browser, so a
// refresh reloads the same conversation from the server.
const newConversationId = () =>
  (crypto.randomUUID?.() || `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`).replace(/[^A-Za-z0-9_-]/g, "");

const STORAGE_KEY = "dd.assistant.conversationId";

const readStoredId = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const storeId = (id) => {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* private mode: the chat still works, it just won't survive a refresh */
  }
};

const startingId = readStoredId() || newConversationId();
storeId(startingId);

const WELCOME = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I'm here to help you find clothes on MonoFit — menswear, womenswear, kids and accessories. Who are you shopping for today, and what are you looking for?",
  blocks: [
    {
      type: "suggestions",
      items: ["Menswear", "Womenswear", "Kids & baby", "What's popular?"],
    },
  ],
};

const initialState = {
  conversationId: startingId,
  messages: [WELCOME],
  input: "",
  status: "idle", // idle | sending | error
  error: "",
  searchState: {},
  // True when the last reply needed an account; the page shows the log-in card.
  loginRequired: false,
  // Remembered so the Retry button can resend a message that failed.
  lastMessage: "",
};

let messageCounter = 0;
const nextId = () => {
  messageCounter += 1;
  return `m${Date.now()}-${messageCounter}`;
};

const assistantSlice = createSlice({
  name: "assistant",
  initialState,
  reducers: {
    setInput(state, action) {
      state.input = action.payload;
    },
    addUserMessage(state, action) {
      state.messages.push({ id: nextId(), role: "user", text: action.payload, blocks: [] });
      state.input = "";
      state.status = "sending";
      state.error = "";
      state.loginRequired = false;
      state.lastMessage = action.payload;
    },
    // Resending the last message: the shopper's bubble is already on screen.
    retrying(state) {
      state.status = "sending";
      state.error = "";
      state.loginRequired = false;
    },
    addAssistantMessage(state, action) {
      const { reply, blocks = [], searchState, action: serverAction } = action.payload;
      state.messages.push({ id: nextId(), role: "assistant", text: reply, blocks });
      if (searchState) state.searchState = searchState;
      state.loginRequired = serverAction === "login_required";
      state.status = "idle";
    },
    setError(state, action) {
      state.status = "error";
      state.error = action.payload;
    },
    setLoginRequired(state, action) {
      state.loginRequired = Boolean(action.payload);
    },
    // Replaces the thread with what the server has stored (page refresh).
    hydrate(state, action) {
      const { messages = [], searchState = {} } = action.payload;
      if (messages.length) state.messages = [WELCOME, ...messages];
      state.searchState = searchState;
      state.status = "idle";
    },
    // A summary card restored from the server has no live token; the one the
    // post-login replay just issued is put back on it.
    attachDraftToken(state, action) {
      for (let i = state.messages.length - 1; i >= 0; i -= 1) {
        const block = state.messages[i].blocks?.find((b) => b.type === "order_draft");
        if (block) {
          block.token = action.payload;
          return;
        }
      }
    },
    reset: resetState,
  },
  // Logging out starts a fresh chat, so the next person on this browser neither
  // sees the old one nor trips over a conversation owned by another account.
  extraReducers: (builder) => builder.addCase(authActions.logout, resetState),
});

function resetState(state) {
  const id = newConversationId();
  storeId(id);
  state.conversationId = id;
  state.messages = [WELCOME];
  state.input = "";
  state.status = "idle";
  state.error = "";
  state.searchState = {};
  state.loginRequired = false;
  state.lastMessage = "";
}

export const assistantActions = assistantSlice.actions;
export default assistantSlice;
