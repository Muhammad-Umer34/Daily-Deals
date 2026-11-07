import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// One price format for the whole store: "Rs 7,490".
export const formatPrice = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

// Same rule the server applies in customerController.postOrder.
export const deliveryFee = (subtotal) => (subtotal >= 2000 ? 0 : 200);
