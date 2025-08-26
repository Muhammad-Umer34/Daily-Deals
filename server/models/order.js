const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: {
    type: Array,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "pending",
  },
  paymentStatus: {
    type: String,
    required: true,
    default: "pending",
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  expectedDeliveryDate: {
    type: Date,
    required: true,
  },
  userName: {
    type: String,
    required: false,
  },
  userEmail: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
