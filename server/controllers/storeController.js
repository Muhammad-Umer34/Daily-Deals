const {check, validationResult}=require("express-validator")
const productSchema = require("../models/store.js").default;
const storeOrderSchema=require("../models/storeOrders.js").default;
const Order = require("../models/order.js");

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
    console.log("Recieved Request Body:",req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, price, quantity, category, images,size,color } = req.body;
      console.log("Received product data:", req.body);

      const product = await productSchema.create({
        name,
        description,
        price,
        stock: quantity,
        category:category.toLowerCase(),
        images,
        size,
        color,
        storeId: req.body.user.id ,
        brand: req.body.user.brand_name || '',
        brand_logo: req.body.user.brand_logo || '',
        reviewsCount: 0,
        views: 0,
        purchasedCount: 0,
        ratings: 0,
        isAvailable: true,
        subcategory:req.body.subcategory.toLowerCase(),
        genre:req.body.genre.toLowerCase(),
        material:req.body.material,

      });
      console.log("Product that is going in database is : ",product);
      res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

exports.getProductsController = async (req, res) => {
  try {
    const products = await productSchema.find({ storeId: req.query?.storeId });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteProductController = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await productSchema.findByIdAndDelete(productId);
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
  console.log("Backend recieve", req.body);
  const { name, description, price, stock, category, images, size, color,subcategory } = req.body;
  try {
    const product = await productSchema.findByIdAndUpdate(
      productId,
      { name, description, price, stock, category,subcategory, images, size, color },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.postStoreOrder = async (req, res) => {
  console.log(req.body);
  const { productId, userId, name, image, price, quantity, color, size,parentOrderId} = req.body;

  try {
    const product = await productSchema.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { storeId } = product;

    const order = await storeOrderSchema.create({
      productId,
      userId,
      storeId,
      productName: name,
      productImage: image,
      price,
      quantity,
      color,
      size,
      parentOrderId:parentOrderId,
    });

    res.status(200).json({ message: "Order Placed Successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getStoreOrdersController = async (req,res)=>{
  const storeId=req.query.storeId;
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
  const storeId=req.query.storeId;
  const orderId=req.params.id;
  try{
    const order = await Order.findOne({_id:orderId});
    res.status(200).json(order);
  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.dispatchOrder = async(req,res)=>{
  const storeId=req.query.storeId;
  const orderId=req.params.id;
  try{
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { orderStatus: 'Dispatched' },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found or does not belong to this store' });
    }
    res.status(200).json({ message: 'Order dispatched successfully', order });
  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.getDashboardData = async (req, res) => {
  const storeID = req.params.id;

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
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const groupByMonth = [
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const groupByStatus = (withRevenue = false) => [
      {
        $group: {
          _id: "$orderStatus",
          totalOrders: { $sum: 1 },
          ...(withRevenue && { totalRevenue: { $sum: "$totalPrice" } })
        }
      },
      { $sort: { _id: 1 } }
    ];

    // Queries
    const last30Days = await Order.aggregate([
      { $match: { createdAt: { $gte: last30DaysDate } } },
      ...groupByDay
    ]);

    const last30DaysSummary = await Order.aggregate([
      { $match: { createdAt: { $gte: last30DaysDate } } },
      ...groupByStatus()
    ]);

    const last6Months = await Order.aggregate([
      { $match: { createdAt: { $gte: last6MonthsDate } } },
      ...groupByMonth
    ]);

    const last6MonthsSummary = await Order.aggregate([
      { $match: { createdAt: { $gte: last6MonthsDate } } },
      ...groupByStatus(true) // with revenue
    ]);

    const last12Months = await Order.aggregate([
      { $match: { createdAt: { $gte: last12MonthsDate } } },
      ...groupByMonth
    ]);

    const last12MonthsSummary = await Order.aggregate([
      { $match: { createdAt: { $gte: last12MonthsDate } } },
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
