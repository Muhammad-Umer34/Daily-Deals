const {check, validationResult}=require("express-validator")
const productSchema = require("../models/store.js").default;
const storeOrderSchema=require("../models/storeOrders.js").default;

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
  const { name, description, price, quantity, category, images, size, color } = req.body;
  try {
    const product = await productSchema.findByIdAndUpdate(
      productId,
      { name, description, price, stock: quantity, category, images, size, color },
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
  const { productId, userId, name, image, price, quantity, color, size } = req.body;

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
    });

    res.status(200).json({ message: "Order Placed Successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
