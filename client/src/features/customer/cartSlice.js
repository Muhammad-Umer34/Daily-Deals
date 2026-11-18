import { createSlice } from "@reduxjs/toolkit";
import { authActions } from "../auth/authSlices";
import { deliveryFee, FREE_DELIVERY_FROM } from "@/lib/utils";

// Shared cart summary so the header badge, the assistant's cart drawer and the
// cart page all show the same numbers. The server is the source of truth: every
// assistant reply carries the current cart, and cart actions re-send it.
const initialState = {
  units: 0,
  subtotal: 0,
  delivery: 0,
  total: 0,
  freeDeliveryShortfall: 0,
  items: [],
  loaded: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart(state, action) {
      const cart = action.payload;
      if (!cart) return;
      state.units = cart.units ?? 0;
      state.subtotal = cart.subtotal ?? 0;
      state.delivery = cart.delivery ?? 0;
      state.total = cart.total ?? 0;
      state.freeDeliveryShortfall = cart.freeDeliveryShortfall ?? 0;
      state.items = cart.items ?? [];
      state.loaded = true;
    },
    // Used where only the lines are known (the existing cart page).
    setItems(state, action) {
      const items = action.payload || [];
      state.items = items;
      state.units = items.reduce((sum, i) => sum + i.quantity, 0);
      state.subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      // An empty cart carries no delivery fee (mirrors services/pricing.js).
      state.delivery = items.length ? deliveryFee(state.subtotal) : 0;
      state.total = state.subtotal + state.delivery;
      state.freeDeliveryShortfall = state.delivery === 0 ? 0 : FREE_DELIVERY_FROM - state.subtotal;
      state.loaded = true;
    },
    clearCart() {
      return { ...initialState, loaded: true };
    },
  },
  // Another account's cart must not linger in the header after logout.
  extraReducers: (builder) => builder.addCase(authActions.logout, () => initialState),
});

export const cartActions = cartSlice.actions;
export default cartSlice;
