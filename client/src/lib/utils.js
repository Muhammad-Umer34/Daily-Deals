import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// One price format for the whole store, in US dollars: "$52", or "$5.50" when
// there are cents.
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
export const formatPrice = (n) => {
  const value = Number(n || 0);
  return Number.isInteger(value) ? usd.format(value).replace(/\.00$/, "") : usd.format(value);
};

// Mirrors server/services/pricing.js — the server's figure is the one charged.
export const FREE_DELIVERY_FROM = 50;
export const DELIVERY_FEE = 5;
export const deliveryFee = (subtotal) => (subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE);
