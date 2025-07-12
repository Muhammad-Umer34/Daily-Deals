const express = require('express');
const {getAllProductForCustomer,getProduct} = require('../controllers/customerController');

const verifyLoggedIn = require('../middlewares/authMiddleware')

const userRouter = express.Router();
userRouter.get('/products',verifyLoggedIn,getAllProductForCustomer);
userRouter.get('/product/:id',verifyLoggedIn,getProduct);
module.exports = userRouter;