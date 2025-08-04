const express = require('express');
const {getAllProductForCustomer,getProduct,postCart,postWishlist,deleteWishlist,getWishlist, postReview,getReview,getCart,deleteCartItem,getProductsByCategory,updateQuantity,getUserWishlist} = require('../controllers/customerController');

const verifyLoggedIn = require('../middlewares/authMiddleware')

const userRouter = express.Router();
userRouter.get('/products',verifyLoggedIn,getAllProductForCustomer);
userRouter.get('/product/:id',verifyLoggedIn,getProduct);
userRouter.post('/cart',verifyLoggedIn,postCart);
userRouter.post('/wishlist/:pId/:uId',verifyLoggedIn,postWishlist);
userRouter.delete('/wishlist/:id',verifyLoggedIn,deleteWishlist);
userRouter.get('/wishlist/:pId/:uId',verifyLoggedIn,getWishlist);
userRouter.get('/wishlist/:uId',verifyLoggedIn,getUserWishlist);
userRouter.post('/review/:pId',verifyLoggedIn,postReview);
userRouter.get('/review/:pId',verifyLoggedIn,getReview);
userRouter.get('/cart',verifyLoggedIn,getCart);
userRouter.delete('/cart/:id',verifyLoggedIn,deleteCartItem);
userRouter.get('/category/products/:genre', getProductsByCategory);
userRouter.put('/cart/:productId',verifyLoggedIn,updateQuantity)


module.exports = userRouter;