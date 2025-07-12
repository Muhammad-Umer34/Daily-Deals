const express = require('express');
const {getAllProductForCustomer,getProduct,postCart} = require('../controllers/customerController');

const verifyLoggedIn = require('../middlewares/authMiddleware')

const userRouter = express.Router();
userRouter.get('/products',verifyLoggedIn,getAllProductForCustomer);
userRouter.get('/product/:id',verifyLoggedIn,getProduct);
userRouter.post('/cart',verifyLoggedIn,postCart);
module.exports = userRouter;