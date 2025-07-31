import {createSlice} from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

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
      state.rating = action.payload;
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
      return {
        ...initialState,
        price: {
          min: action.payload?.min ?? initialState.price.min,
          max: action.payload?.max ?? initialState.price.max,
        },
      };
    }
  }
})
export const filterActions = filterSlice.actions;
export default filterSlice;