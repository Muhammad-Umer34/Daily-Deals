import mongoose from 'mongoose';
const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  productId:{
    type: String,
    required: true,
  },
  product: {
    type: Object,
    required: true,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;