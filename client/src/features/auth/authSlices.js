import { createSlice} from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("accessToken");

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