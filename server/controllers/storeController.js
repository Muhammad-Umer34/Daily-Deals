const crypto = require("crypto");
const {check, validationResult}=require("express-validator")
const productStore = require("../models/store.js");
const productSchema = productStore.default;
const { buildVariants } = productStore;
const Label = require("../models/label");
const taxonomy = require("../services/catalog/taxonomy");
const { embedProducts } = require("../services/catalog/embeddings");
const storeOrderSchema=require("../models/storeOrders.js").default;
const Order = require("../models/order.js");
const User = require("../models/user");

// The store owner's id always comes from the verified JWT (req.user), never from the request.
const ownsOrder = (orderId, storeId) =>
  storeOrderSchema.exists({ parentOrderId: orderId, storeId });

// A store sees only its own lines of a multi-store order, and its own shipping status.
const asSeenByStore = async (order, storeId) => {
  const lines = await storeOrderSchema.find({ parentOrderId: order.id, storeId });
  const productIds = new Set(lines.map((l) => l.productId));
  const own = order.toObject();
  own.items = own.items.filter((i) => productIds.has(String(i.productId)));
  own.totalPrice = own.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  own.orderStatus = lines.every((l) => l.status === 'Dispatched') ? 'Dispatched' : 'Pending';
  return own;
};

exports.postProductController = [
  check('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({min: 3})
    .withMessage('Product name must be at least 3 characters long'),
  check('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({min: 30})
    .withMessage('Description must be at least 30 characters long'),
  check('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number')
    .custom(value => {
      if (value <= 0) {
        throw new Error('Price must be greater than zero');
      }
      return true;
    }),
  check('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({gt: 0})
    .withMessage('Quantity must be a positive integer'),
  check('category')
    .notEmpty()
    .withMessage('Category is required'),
  check('subcategory')
  .notEmpty()
  .withMessage('SubCategory is required'),
   check('genre')
  .notEmpty()
  .withMessage('Genre is required'),
  check('material')
  .notEmpty()
  .withMessage('Material is required'),
  check('images')
    .custom((value, { req }) => {
      if (!req.body.images || !Array.isArray(req.body.images) || req.body.images.length === 0) {
        throw new Error('At least one image is required');
      }
      return true;
    }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, price, quantity, category, images, size, color } = req.body;
      const owner = await User.findById(req.user.id);
      const label = await Label.findOne({ sellerId: req.user.id });

      const product = await productSchema.create({
        name,
        description,
        price,
        category: String(category).toLowerCase(),
        // Free text from the form ("Pants", "Frock") lands on the shared vocabulary.
        subcategory: taxonomy.categoryForWord(req.body.subcategory) || String(req.body.subcategory).toLowerCase(),
        genre: String(req.body.genre).toLowerCase(),
        material: req.body.material,
        images,
        variants: Array.isArray(req.body.variants) && req.body.variants.length
          ? req.body.variants
          : buildVariants({ sizes: [].concat(size || []), colors: [].concat(color || []), stock: Number(quantity) || 0, skuPrefix: `${(label?.slug || "mf").slice(0, 4)}-${crypto.randomBytes(2).toString("hex")}` }),
        ...pickAttributes(req.body),
        labelId: label?._id,
        storeId: req.user.id,
        brand: label?.name || owner?.brand_name || '',
        brand_logo: label?.logo || owner?.brand_logo || '',
      });
      // Best effort: a product without a meaning vector is still found by keywords.
      embedProducts([product._id]).catch((e) => console.warn('[catalog] embedding skipped:', e.message));
      res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ errors: Object.values(error.errors).map((e) => ({ msg: e.message, path: e.path })) });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

exports.getProductsController = async (req, res) => {
  try {
    const products = await productSchema.find({ storeId: req.user.id });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteProductController = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await productSchema.findOneAndDelete({ _id: productId, storeId: req.user.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


exports.updateProductController = async (req, res) => {
  const productId = req.params.id;
  const { name, description, price, stock, category, images, size, color, subcategory, variants, status } = req.body;
  try {
    // Loaded and saved (not updated in place) so variants and derived fields stay consistent.
    const product = await productSchema.findOne({ _id: productId, storeId: req.user.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = String(category).toLowerCase();
    if (subcategory !== undefined) product.subcategory = taxonomy.categoryForWord(subcategory) || String(subcategory).toLowerCase();
    if (images !== undefined) product.images = images;
    if (status !== undefined) product.status = status;
    Object.assign(product, pickAttributes(req.body));

    if (Array.isArray(variants) && variants.length) {
      product.variants = variants;
    } else if (size !== undefined || color !== undefined || stock !== undefined) {
      // The edit form sends sizes, colours and one stock number: rebuild the variants from them.
      product.variants = buildVariants({
        sizes: [].concat(size ?? product.size),
        colors: [].concat(color ?? product.color),
        stock: stock !== undefined ? Number(stock) : product.stock,
        skuPrefix: `${taxonomy.slugify(product.brand || "mf").slice(0, 4)}-${String(product._id).slice(-4)}`,
      });
    }
    await product.save();
    embedProducts([product._id]).catch((e) => console.warn('[catalog] embedding skipped:', e.message));
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errors: Object.values(error.errors).map((e) => ({ msg: e.message, path: e.path })) });
    }
    console.error("Error updating product:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// The optional descriptive fields a seller may send; anything else is ignored.
function pickAttributes(body = {}) {
  const out = {};
  const list = (v) => [].concat(v || []).map((x) => String(x).toLowerCase().trim()).filter(Boolean);
  if (body.occasions !== undefined) out.occasions = list(body.occasions);
  if (body.seasons !== undefined) out.seasons = list(body.seasons);
  if (body.tags !== undefined) out.tags = list(body.tags).slice(0, 12);
  for (const key of ["fit", "pattern", "fabricWeight"]) if (body[key] !== undefined) out[key] = String(body[key]).toLowerCase();
  if (body.compareAtPrice !== undefined) out.compareAtPrice = body.compareAtPrice === null ? null : Number(body.compareAtPrice);
  return out;
}

exports.getStoreOrdersController = async (req,res)=>{
  const storeId=req.user.id;
  try{
    const orders=await storeOrderSchema.find({storeId:storeId});
    res.status(200).json(orders);
  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.getOrderDetailsController = async(req,res)=>{
  const storeId=req.user.id;
  const orderId=req.params.id;
  try{
    if (!(await ownsOrder(orderId, storeId))) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = await Order.findOne({_id:orderId});
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(await asSeenByStore(order, storeId));
  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.dispatchOrder = async(req,res)=>{
  const storeId=req.user.id;
  const orderId=req.params.id;
  try{
    if (!(await ownsOrder(orderId, storeId))) {
      return res.status(404).json({ error: 'Order not found or does not belong to this store' });
    }
    await storeOrderSchema.updateMany(
      { parentOrderId: orderId, storeId: storeId },
      { status: 'Dispatched' }
    );
    // The customer's order is only "Dispatched" once every store in it has shipped its part.
    const stillPending = await storeOrderSchema.exists({ parentOrderId: orderId, status: { $ne: 'Dispatched' } });
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { orderStatus: stillPending ? 'Partially Dispatched' : 'Dispatched' },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found or does not belong to this store' });
    }

    res.status(200).json({ message: 'Order dispatched successfully', order: await asSeenByStore(order, storeId) });
  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.getDashboardData = async (req, res) => {
  const storeID = req.user.id;

  try {
    // Reusable date helpers
    const now = new Date();
    const last30DaysDate = new Date(new Date().setDate(now.getDate() - 30));
    const last6MonthsDate = new Date(new Date().setMonth(now.getMonth() - 6));
    const last12MonthsDate = new Date(new Date().setFullYear(now.getFullYear() - 1));

    // Pipeline helpers
    const groupByDay = [
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const groupByMonth = [
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const groupByStatus = (withRevenue = false) => [
      {
        $group: {
          _id: "$status",
          totalOrders: { $sum: 1 },
          ...(withRevenue && { totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } } })
        }
      },
      { $sort: { _id: 1 } }
    ];

    // Queries
    const last30Days = await storeOrderSchema.aggregate([
      { $match: { storeId: storeID, createdAt: { $gte: last30DaysDate } } },
      ...groupByDay
    ]);

    const last30DaysSummary = await storeOrderSchema.aggregate([
      { $match: { storeId: storeID, createdAt: { $gte: last30DaysDate } } },
      ...groupByStatus()
    ]);

    const last6Months = await storeOrderSchema.aggregate([
      { $match: { storeId: storeID, createdAt: { $gte: last6MonthsDate } } },
      ...groupByMonth
    ]);

    const last6MonthsSummary = await storeOrderSchema.aggregate([
      { $match: { storeId: storeID, createdAt: { $gte: last6MonthsDate } } },
      ...groupByStatus(true) // with revenue
    ]);

    const last12Months = await storeOrderSchema.aggregate([
      { $match: { storeId: storeID, createdAt: { $gte: last12MonthsDate } } },
      ...groupByMonth
    ]);

    const last12MonthsSummary = await storeOrderSchema.aggregate([
      { $match: { storeId: storeID, createdAt: { $gte: last12MonthsDate } } },
      ...groupByStatus()
    ]);

    res.status(200).json({
      last30Days,
      last30DaysSummary,
      last6Months,
      last6MonthsSummary,
      last12Months,
      last12MonthsSummary
    });

  } catch (error) {
    console.error("Dashboard Data Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
