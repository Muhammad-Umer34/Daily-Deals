const productSchema = require('../models/store').default; 
const Cart = require('../models/cart').default; 
const Wishlist = require('../models/wishlist').default;
exports.getAllProductForCustomer = async (req, res) => {
  try {
    const products = await productSchema.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
exports.getProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await productSchema.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

exports.postCart = async (req, res) => {
  console.log("Received cart data:", req.body);
  const { productId, userId, name, image, price, quantity, color, size } = req.body;

  try {
    const cartItem = new Cart({
      productId,
      userId,
      name,
      image,
      price,
      quantity,
      color,
      size   
    });

    await cartItem.save();

    res.status(201).json({ message: "Product added to cart successfully", cartItem });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.postWishlist = async (req,res)=>{
  console.log("Recieved Request Body in Wishlist : ",req.body);
  const productId = req.params.pId;
  const userId = req.params.uId;
  try {
    const wishlistItem = new Wishlist({
      productId,
      userId
    });

    await wishlistItem.save();

    res.status(201).json({ message: "Product added to wishlist successfully", wishlistItem });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

exports.deleteWishlist = async (req,res)=>
{
    console.log("Recieved Request Body in Wishlist : ",req.body);
  const productId = req.params.id;
  const userId = req.body.userId;

  try {
    const wishlistItem = await Wishlist.findOneAndDelete({ productId, userId });
    if (!wishlistItem) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }
    res.status(200).json({ message: "Product removed from wishlist successfully" });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}