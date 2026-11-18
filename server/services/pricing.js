// One source of truth for what a shopper pays on top of the goods.
//
// Quoted by the checkout controller, the assistant's cart tools and the help
// chatbot, so it must not be copied into any of them. The client mirrors this
// rule in client/src/lib/utils.js for display only — the server's answer wins.
// US dollars. Free delivery from $50, otherwise a flat $5.
const FREE_DELIVERY_FROM = 50;
const DELIVERY_FEE = 5;

const deliveryFee = (subtotal) => (subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE);

/** Totals for a set of cart lines, priced from the lines' own prices. */
const cartTotals = (items = []) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Nothing in the cart costs nothing: charging delivery on an empty cart
  // would quote a Rs 200 total to a shopper who has added no items.
  const delivery = items.length ? deliveryFee(subtotal) : 0;
  return {
    units: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    delivery,
    total: subtotal + delivery,
    // How much more buys free delivery; 0 once it's already free.
    freeDeliveryShortfall: delivery === 0 ? 0 : FREE_DELIVERY_FROM - subtotal,
  };
};

module.exports = { deliveryFee, cartTotals, FREE_DELIVERY_FROM, DELIVERY_FEE };
