import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/auth/authSlices";
import uiSlice from "./features/admin/uiSlice";

const appStore = configureStore({reducer : {auth : authSlice.reducer,ui: uiSlice.reducer}});

export default appStore ; 