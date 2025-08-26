import mongoose from "mongoose";

const storeOrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  storeId: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  size: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  parentOrderId: { type: String ,required:false},
  userName: { type: String ,required:false},
  userEmail: { type: String ,required:false},
  createdAt: { type: Date, default: Date.now },
});

const StoreOrder = mongoose.model("StoreOrder", storeOrderSchema); 
export default StoreOrder;
