import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/auth/authSlices";
import uiSlice from "./features/admin/uiSlice";
import productSlice from "./features/admin/editProductSlice";
import activeSlice from "./features/customer/activeSlice";

const appStore = configureStore({reducer : {auth : authSlice.reducer,ui: uiSlice.reducer,product: productSlice.reducer,active:activeSlice.reducer}});

export default appStore ; 