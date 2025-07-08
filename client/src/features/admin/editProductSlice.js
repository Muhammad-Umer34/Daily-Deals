import { createSlice } from "@reduxjs/toolkit";

const productInitialState = {
  product:null,
  imageUpdated : false,
};

const productSlice = createSlice({
  name: "product",
  initialState: productInitialState,
  reducers: {
    setProductDetails(state, action) {
     state.product  = action.payload;
    },
    resetProductDetails(state) {
      return { ...productInitialState };
    },
    setImageUpdated(state) {
      state.imageUpdated = true;
    },
  }
});

export const productActions = productSlice.actions;
export default productSlice;
