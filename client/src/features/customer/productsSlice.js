import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products:[],
  FilteredProducts:[],
  pageNo : 1,
  category : null,
  startIndex : 0 ,
  endIndex : 0 ,
  totalProducts : 0 ,
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
        setCategory(state,action){
          state.category = action.payload;
        },
        setPageNo(state,action){
            state.pageNo = action.payload;  
        },
        setFilteredProducts(state,action){
            state.FilteredProducts = action.payload;
        },
        resetFilteredProducts(state){
            state.FilteredProducts = state.products;
        },
        setStartIndex(state,action){
            state.startIndex = action.payload;
        },
        setEndIndex(state,action){
            state.endIndex = action.payload;
        },
        setTotalProducts(state,action){
            state.totalProducts = action.payload;
        }
    }
  }
)

export const userProductActions = userProductSlice.actions;
export default userProductSlice;