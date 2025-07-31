import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products:[],
  FilteredProducts:[],
}
const userProductSlice = createSlice(
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

export const userProductActions = userProductSlice.actions;
export default userProductSlice;