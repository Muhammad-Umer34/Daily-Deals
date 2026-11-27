const productSchema = require("../models/store").default;
const Cart = require("../models/cart").default;
const Wishlist = require("../models/wishlist").default;
const Review = require("../models/review").default;
const Product = require("../models/store").default;
const User = require("../models/user");
const Order = require("../models/order.js");
const StoreOrder = require("../models/storeOrders.js").default;
const mongoose = require("mongoose");

// Free delivery from $50, otherwise $5 (services/pricing.js). Shared with the
// assistant's cart tools; the client mirrors it in src/lib/utils.js for display.
const { deliveryFee } = require("../services/pricing");
const { findVariant } = require("../services/catalog/stock");
const { placeOrder, OrderError } = require("../services/orders");

exports.getAllProductForCustomer = async (req, res) => {
  try {
    const products = await productSchema.find({ isAvailable: true });
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
  const { productId, color, size } = req.body;
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  try {
    // Name, image and price come from the product record, not the client.
    const product = await productSchema.findById(productId);
    if (!product || product.status !== "active") {
      return res.status(404).json({ message: "Product not found" });
    }
    // Stock is per size and colour: find that exact variant and check it.
    const variant = findVariant(product, { size, color });
    if (!variant) {
      return res.status(400).json({ message: `Choose one of the sizes and colours this item comes in.` });
    }
    const inCart = await Cart.findOne({ productId, userId: req.user.id, sku: variant.sku });
    const wanted = quantity + (inCart?.quantity || 0);
    if (wanted > variant.stock) {
      return res.status(400).json({
        message: variant.stock > 0
          ? `Only ${variant.stock} left in ${variant.color}, size ${variant.size}.`
          : `Sold out in ${variant.color}, size ${variant.size}.`,
      });
    }
    // Same variant already in the cart: add to that line instead of duplicating it.
    if (inCart) {
      inCart.quantity = wanted;
      await inCart.save();
      return res.status(200).json({ message: "Cart updated", cartItem: inCart });
    }
    const cartItem = new Cart({
      productId,
      userId: req.user.id,
      name: product.name,
      image: product.images?.[0],
      price: product.price,
      quantity,
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
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
  const product = req.body.product;
  const userId = req.user.id;
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
  const userId = req.user.id;
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
  const { pId } = req.params;
  const uId = req.user.id;

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
  const productId = req.params.pId;
  const { rating, comment } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
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
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const cartItems = await Cart.find({ userId });
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCartItem = async (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.id;
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
  const term = req.params.genre?.toLowerCase();
  try {
    // "all" lists everything; otherwise match a gender (genre) or a style (category, e.g. "casual").
    const products = await productSchema.find(
      term === "all" ? { isAvailable: true } : { isAvailable: true, $or: [{ genre: term }, { category: term }] }
    );
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateQuantity = async (req, res) => {
  // The route param is the cart line id: one product can sit in the cart in several sizes/colours.
  const itemId = req.params.productId;
  const userId = req.user.id;
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }
  try {
    const cartItem = await Cart.findOne({ _id: itemId, userId });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    // Never more than that size and colour has left.
    const product = await productSchema.findById(cartItem.productId);
    const variant = product && findVariant(product, { sku: cartItem.sku, size: cartItem.size, color: cartItem.color });
    if (variant && quantity > variant.stock) {
      return res.status(400).json({ message: `Only ${variant.stock} left in ${variant.color}, size ${variant.size}.` });
    }
    cartItem.quantity = quantity;
    if (variant && !cartItem.sku) cartItem.sku = variant.sku;
    await cartItem.save();

    res.status(200).json(cartItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserWishlist = async (req, res) => {
  const userId = req.user.id;
  try {
    const wishlistItems = await Wishlist.find({ userId });
    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUserInfo = async (req, res) => {
  const userId = req.user.id;
  const { name, email, address, phoneNumber } = req.body;

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
  // Items, prices and statuses are built by services/orders.placeOrder from the
  // user's cart and the product records; the client only supplies delivery
  // details. The assistant's confirm-order endpoint runs the same function.
  const { shippingAddress, paymentMethod, phoneNumber, userName } = req.body;
  if (!shippingAddress?.trim() || !phoneNumber?.trim() || !paymentMethod) {
    return res.status(400).json({ message: "Phone number, shipping address and payment method are required" });
  }
  try {
    const { order } = await placeOrder({
      userId: req.user.id,
      userName,
      userEmail: req.user.email,
      shippingAddress,
      phoneNumber,
      paymentMethod,
    });
    res.status(201).json(order);
  } catch (error) {
    // "Cart is empty", "Only 3 left of X", "Invalid cart item: X" — the
    // checkout page prints these, so they keep their 400 as before.
    if (error instanceof OrderError) {
      return res.status(400).json({ message: error.userMessage });
    }
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  const userId = req.user.id;
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

exports.getTopSellingProducts = async (req, res) => {
  try {
    const [topProducts, newArrival, topViewed] = await Promise.all([
      productSchema.find({ isAvailable: true }).sort({ purchasedCount: -1 }).limit(12),
      productSchema.find({ isAvailable: true }).sort({ createdAt: -1 }).limit(12),
      productSchema.find({ isAvailable: true }).sort({ views: -1 }).limit(12)
    ]);

    res.status(200).json({
      message: "Top selling products fetched successfully",
      topProducts,
      newArrival,
      topViewed,
    });
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// The catalogue's vocabulary, for filters, the seller form and the assistant.
const taxonomy = require("../services/catalog/taxonomy");
exports.getCatalogOptions = (_req, res) => {
  res.status(200).json({
    departments: taxonomy.DEPARTMENTS,
    styles: taxonomy.STYLES,
    occasions: taxonomy.OCCASIONS,
    seasons: taxonomy.SEASONS,
    fits: taxonomy.FITS,
    patterns: taxonomy.PATTERNS,
    fabricWeights: taxonomy.FABRIC_WEIGHTS,
    colorFamilies: Object.keys(taxonomy.COLOR_FAMILIES),
    categories: taxonomy.CATEGORIES.map(({ slug, name, departments }) => ({ slug, name, departments })),
  });
};

// The shopper's opt-in profile: saved sizes, colours, departments and budget.
const cleanPreferences = (body = {}) => {
  const str = (v) => (typeof v === "string" ? v.trim().slice(0, 12) : "");
  const sizes = body.sizes || {};
  return {
    sizes: { top: str(sizes.top), bottom: str(sizes.bottom), shoe: str(sizes.shoe), kids: str(sizes.kids) },
    colors: (Array.isArray(body.colors) ? body.colors : []).filter((c) => Object.keys(taxonomy.COLOR_FAMILIES).includes(c)).slice(0, 8),
    departments: (Array.isArray(body.departments) ? body.departments : []).filter((d) => taxonomy.DEPARTMENTS.includes(d)),
    budget: Number.isFinite(Number(body.budget)) && Number(body.budget) > 0 ? Math.min(Number(body.budget), 100000) : null,
  };
};
exports.cleanPreferences = cleanPreferences;

exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("preferences").lean();
    res.status(200).json(user?.preferences || cleanPreferences());
  } catch (error) {
    console.error("Error loading preferences:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const preferences = cleanPreferences(req.body);
    await User.updateOne({ _id: req.user.id }, { $set: { preferences } });
    res.status(200).json(preferences);
  } catch (error) {
    console.error("Error saving preferences:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
