import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  products:[],
  filteredProducts:[]
}
const storeOwnerProductsSlice = createSlice({
  name: "storeOwnerProducts",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.filteredProducts = action.payload;
    },
    filterProducts: (state, action) => {
      state.filteredProducts = action.payload;
    },
  },
})
export const storeOwnerProductsActions = storeOwnerProductsSlice.actions;
export default storeOwnerProductsSlice ;