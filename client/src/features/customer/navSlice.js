import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  active : "Profile Information",
}
const navSlice = createSlice({
  name : "nav",
  initialState,
  reducers:{
    setActive(state,action){
      state.active=action.payload;
    }
  }
})
export const navActions = navSlice.actions;
export default navSlice;