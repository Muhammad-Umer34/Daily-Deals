import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  storeId: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  size: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
})
const storeOrder = mongoose.model("Order", orderSchema);
export default storeOrder;