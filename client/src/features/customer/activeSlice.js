import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeField: "Home"
};


const activeSlice = createSlice({
  name: "active",
  initialState,
  reducers: {
    changeField(state, action) {
      state.activeField = action.payload;
    }
  }
},
);
export const activeActions = activeSlice.actions;
export default activeSlice;
