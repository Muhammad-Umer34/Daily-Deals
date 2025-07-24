import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products:[],
  FilteredProducts:[],
}
const productSlice = createSlice(
  {
    name:"products",
    initialState,
    reducers:{
        setProducts(state,action){
            state.products = action.payload;
            state.FilteredProducts = action.payload; 
        },
        setFilteredProducts(state,action){
            state.FilteredProducts = action.payload;
        },
        resetFilteredProducts(state){
            state.FilteredProducts = state.products;
        }
    }
  }
)
console.log("productSlice", productSlice);
console.log("productSlice.actions", productSlice.actions);
export const productActions = productSlice.actions;
export default productSlice;