import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./src/features/auth/authSlices";

const appStore = configureStore({reducer : {auth : authSlice.reducer}})

export default appStore ; 