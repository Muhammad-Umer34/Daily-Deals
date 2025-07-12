import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    productId:{
      type : String,
      required : true,
    },
    userId:{
      type: String,
      required:true,
    },
    name:{
       type:String,
      required:true,
    },
    image:{
       type:String,
      required:true,
    },
    price:{
      type:Number,
      required:true,
    },
    quantity:{
      type:Number,
      required:true,
      default:1,
    },
    color: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    }
})

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;