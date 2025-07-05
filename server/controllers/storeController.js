const { check, validationResult } = require("express-validator");
const productSchema = require('../models/store').default; 

const postProductController = [
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
      const { name, description, price, quantity, category, images,size,color } = req.body;
      console.log("Received product data:", req.body);

      const product = await productSchema.create({
        name,
        description,
        price,
        stock: quantity,
        category,
        images,
        size,
        color,
        storeId: req.body.user.id ,
        brand: req.body.user.brand_name || '',
        brand_logo: req.body.user.brand_logo || '',
        reviewsCount: 0,
        views: 0,
        purchasedCount: 0
      });
      res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

module.exports = { postProductController };
