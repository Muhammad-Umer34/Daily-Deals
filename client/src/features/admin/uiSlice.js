import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedField: "Dashboard",
  dashboardField:"Last 30 Days"
};


const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    changeField(state, action) {
      state.selectedField = action.payload;
    },
    changeDashboardField(state,action){
      state.dashboardField=action.payload;
    }
  }
},
);
export const uiActions = uiSlice.actions;
export default uiSlice;
