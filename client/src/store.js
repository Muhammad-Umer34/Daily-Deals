import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/auth/authSlices";
import uiSlice from "./features/admin/uiSlice";
import productSlice from "./features/admin/editProductSlice";
import activeSlice from "./features/customer/activeSlice";
import userProductSlice from "./features/customer/productsSlice";
import filterSlice from "./features/customer/filterSlice";

const appStore = configureStore({reducer : {auth : authSlice.reducer,ui: uiSlice.reducer,product: productSlice.reducer,active:activeSlice.reducer,userProducts:userProductSlice.reducer,filter:filterSlice.reducer}});

export default appStore ; 