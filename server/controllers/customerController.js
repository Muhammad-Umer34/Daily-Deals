const productSchema = require("../models/store").default;
const Cart = require("../models/cart").default;
const Wishlist = require("../models/wishlist").default;
const Review = require("../models/review").default;
const Product = require("../models/store").default;
const User = require("../models/user");
const Order = require("../models/order.js");
const mongoose = require("mongoose");

exports.getAllProductForCustomer = async (req, res) => {
  try {
    const products = await productSchema.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
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
};

exports.postCart = async (req, res) => {
  console.log("Received cart data:", req.body);
  const { productId, userId, name, image, price, quantity, color, size } =
    req.body;

  try {
    const cartItem = new Cart({
      productId,
      userId,
      name,
      image,
      price,
      quantity,
      color,
      size,
    });

    await cartItem.save();

    res
      .status(201)
      .json({ message: "Product added to cart successfully", cartItem });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.postWishlist = async (req, res) => {
  console.log(req.body);
  const product = req.body.product;
  const userId = req.params.uId;
  const productId = req.params.pId;
  try {
    const wishlistItem = new Wishlist({
      productId,
      product,
      userId,
    });
    await wishlistItem.save();
    res.status(201).json({
      message: "Product added to wishlist successfully",
      wishlistItem,
    });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteWishlist = async (req, res) => {
  const productId = req.params.id;
  const userId = req.body.userId;
  console.log("In delete controller ");
  try {
    const wishlistItem = await Wishlist.findOneAndDelete({ productId, userId });
    if (!wishlistItem) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }
    res
      .status(200)
      .json({ message: "Product removed from wishlist successfully" });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getWishlist = async (req, res) => {
  const { pId, uId } = req.params;

  if (!pId || !uId) {
    return res.status(400).json({ message: "Missing product or user ID" });
  }

  try {
    const productId = new mongoose.Types.ObjectId(pId);
    const userId = new mongoose.Types.ObjectId(uId);

    const exists = await Wishlist.exists({ productId, userId });

    if (!exists) {
      return res
        .status(200)
        .json({ message: "Wishlist item not found", exists: false });
    }

    res
      .status(200)
      .json({ message: "Product exists with this user", exists: true });
  } catch (error) {
    console.error("Error fetching wishlist item:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.postReview = async (req, res) => {
  console.log("Received review data:", req.body);
  const productId = req.params.pId;
  const { rating, comment, user } = req.body;
  try {
    const review = new Review({
      productId,
      userId: user.id,
      userName: user.name,
      userProfilePhoto: user.profilePhoto,
      rating,
      comment,
    });
    await review.save();
    await Product.findByIdAndUpdate(
      productId,
      {
        $inc: { reviewsCount: 1 },
      },
      { new: true }
    );
    const averageRating = await Review.aggregate([
      { $match: { productId } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);
    console.log("Average rating:", averageRating);
    await Product.findByIdAndUpdate(
      productId,
      { averageRating: averageRating[0]?.averageRating || 0 },
      { new: true }
    );

    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getReview = async (req, res) => {
  const productId = req.params.pId;
  try {
    const reviews = await Review.find({ productId });
    if (!reviews || reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this product" });
    }
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCart = async (req, res) => {
  const userId = req.query.userId;
  try {
    const cartItems = await Cart.find({ userId });
    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: "No items found in cart" });
    }
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCartItem = async (req, res) => {
  const itemId = req.params.id;
  const userId = req.body.userId;
  try {
    const cartItem = await Cart.findOneAndDelete({ _id: itemId, userId });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  const genre = req.params.genre;
  console.log("Genre is :", genre);
  try {
    const products = await productSchema.find({ genre: genre });
    console.log(products);
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateQuantity = async (req, res) => {
  const productId = req.params.productId?.toString();
  const userId = req.body.user?.toString();
  const quantity = req.body.quantity;
  try {
    const cartItem = await Cart.findOneAndUpdate(
      { productId, userId },
      { $set: { quantity } },
      { new: true }
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json(cartItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserWishlist = async (req, res) => {
  const userId = req.params.uId;
  try {
    const wishlistItems = await Wishlist.find({ userId });
    if (!wishlistItems || wishlistItems.length === 0) {
      return res.status(404).json({ message: "No items found in wishlist" });
    }
    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUserInfo = async (req, res) => {
  const userId = req.params.id;
  const { name, email, address, phoneNumber } = req.body;

  console.log(
    "From Controller:",
    { name, email, address, phoneNumber },
    userId
  );

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, address, phoneNumber },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.postOrder = async (req, res) => {
  const {
    items,
    totalPrice,
    shippingAddress,
    paymentMethod,
    phoneNumber,
    orderStatus,
    paymentStatus,
    expectedDeliveryDate,
    userId,
  } = req.body;
  const newOrder = new Order({
    items,
    totalPrice,
    shippingAddress,
    paymentMethod,
    phoneNumber,
    orderStatus,
    paymentStatus,
    expectedDeliveryDate,
    userId,
  });
  try {
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteUserCart = async (req, res) => {
  console.log("In delete controller ");
  console.log(req.params);
  const userId = req.params.userId;
  try {
    const deletedCart = await Cart.deleteMany({ userId });
    if (!deletedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json({ message: "Cart deleted successfully" });
  } catch (error) {
    console.log(erorr);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  const userId = req.params.userId;
  try {
    const orders = await Order.find({ userId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.increaseOrderViews = async (req, res) => {
  const productId = req.params.productId;

  try {
    const updatedProduct = await productSchema.findByIdAndUpdate(
      productId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Views count updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.increasePurchasedCount = async (req, res) => {
  try {
    const productId = req.params.productId;
    let quantity = req.body.quantity;

    console.log("Received:", productId, quantity);

    quantity = Number(quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const updatedProduct = await productSchema.findByIdAndUpdate(
      productId,
      { $inc: { purchasedCount: quantity } },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Purchased count updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating purchased count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await productSchema
      .find()
      .sort({ purchasedCount: -1 }) 
      .limit(4);

    res.status(200).json({
      message: "Top selling products fetched successfully",
      products: topProducts,
    });
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
