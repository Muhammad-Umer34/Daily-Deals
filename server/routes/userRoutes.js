const express = require('express');
const {getAllProductForCustomer,getProduct,postCart,postWishlist,deleteWishlist} = require('../controllers/customerController');

const verifyLoggedIn = require('../middlewares/authMiddleware')

const userRouter = express.Router();
userRouter.get('/products',verifyLoggedIn,getAllProductForCustomer);
userRouter.get('/product/:id',verifyLoggedIn,getProduct);
userRouter.post('/cart',verifyLoggedIn,postCart);
userRouter.post('/wishlist/:pId/:uId',verifyLoggedIn,postWishlist);
userRouter.delete('/wishlist/:id',verifyLoggedIn,deleteWishlist);
module.exports = userRouter;