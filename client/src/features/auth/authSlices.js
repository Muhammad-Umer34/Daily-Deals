import { createSlice} from "@reduxjs/toolkit";

// True when the access token expires within `marginMs` (or can't be read).
// An expired token is not a logout: the 7-day refresh cookie renews it (see session.js).
export const tokenExpired = (token, marginMs = 0) => {
  try {
    return JSON.parse(atob(token.split(".")[1])).exp * 1000 < Date.now() + marginMs;
  } catch {
    return true;
  }
};
// A damaged saved session (e.g. the text "undefined") must mean "logged out",
// not a crash that leaves every page blank.
const readStoredUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user && typeof user === "object" ? user : null;
  } catch {
    return null;
  }
};
const storedUser = readStoredUser();
const storedToken = storedUser ? localStorage.getItem("accessToken") : null;
if (!storedUser) {
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  } catch { /* storage blocked: nothing to clean */ }
}

const initialState = {
  user : storedUser,
  accessToken : storedToken || null,
  isAuthenticated: !!(storedUser && storedToken)
}

const authSlice = createSlice({
  name:"auth",
  initialState,
  reducers:{
    login(state,action){
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("accessToken", action.payload.accessToken);
    },
    logout(state){
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    },
    setAccessToken(state,action){
      state.accessToken = action.payload;
      localStorage.setItem("accessToken", action.payload);
    },
    updateUser(state,action){
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    }
  }
})

export const authActions = authSlice.actions;
export default authSlice;