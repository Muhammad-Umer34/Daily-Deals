const productSchema = require('../models/store').default; 
const Cart = require('../models/cart').default; 
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
