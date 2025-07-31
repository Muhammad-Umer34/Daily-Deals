import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  size:null,
  color:null,
  brand:null,
  price:{
    max:1000,
    min:null
  },
  rating:null,
  material:null,
}

const filterSlice = createSlice({
  name:"filter",
  initialState,
  reducers:{
    setSize(state,action){
      state.size = action.payload;
    },
    setColor(state,action){
      state.color = action.payload;
    },
     setBrand(state,action){
      state.brand = action.payload;
    },
     setRating(state,action){
      state.size = action.payload;
    },
    setMaterial(state,action)
    {
      state.material = action.payload;
    },
    setPrice(state,action)
    {
      state.price.max = action.payload.max;
      state.price.min = action.payload.min;
    },
    resetFilters(state,action)
    {
      return initialState;
    }
  }
})
export const filterActions = filterSlice.actions;
export default filterSlice;