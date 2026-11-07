import { createSlice} from "@reduxjs/toolkit";

// A token whose exp has passed is treated as logged out, so the UI never shows a dead session.
const tokenExpired = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1])).exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
let storedUser = localStorage.getItem("user");
let storedToken = localStorage.getItem("accessToken");
if (storedToken && tokenExpired(storedToken)) {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  storedUser = storedToken = null;
}

const initialState = {
  user : storedUser ? JSON.parse(storedUser) : null,
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
    updateUser(state,action){
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    }
  }
})

export const authActions = authSlice.actions;
export default authSlice;