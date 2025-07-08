import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/auth/authSlices";
import uiSlice from "./features/admin/uiSlice";
import productSlice from "./features/admin/editProductSlice";

const appStore = configureStore({reducer : {auth : authSlice.reducer,ui: uiSlice.reducer,product: productSlice.reducer}});

export default appStore ; 