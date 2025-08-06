import { createSlice} from "@reduxjs/toolkit";

const initialState = {
  user : null,
  accessToken : null,
  isAuthenticated:false
}

const authSlice = createSlice({
  name:"auth",
  initialState,
  reducers:{
    login(state,action){
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    updateUser(state,action){
      return {
        ...state,
        user:action.payload
      }
    }
  }
})

export const authActions = authSlice.actions;
export default authSlice;