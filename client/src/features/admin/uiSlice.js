import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedField: "Dashboard"
};


const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    changeField(state, action) {
      state.selectedField = action.payload;
    }
  }
},
);
export const uiActions = uiSlice.actions;
export default uiSlice;
