import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  products:[],
  filteredProducts:[],
  orders:[],
  filteredOrders:[]
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
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.filteredOrders = action.payload;
    },
    filterOrders: (state, action) => {
      state.filteredOrders = action.payload;
    },
  },
})
export const storeOwnerProductsActions = storeOwnerProductsSlice.actions;
export default storeOwnerProductsSlice ;