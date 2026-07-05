const express = require('express');
const {getAllProductForCustomer,getProduct,postCart,postWishlist,deleteWishlist,getWishlist, postReview,getReview,getCart,deleteCartItem,getProductsByCategory,updateQuantity,getUserWishlist,updateUserInfo,postOrder,deleteUserCart,getAllOrders,increaseOrderViews,increasePurchasedCount,getTopSellingProducts} = require('../controllers/customerController');

const verifyLoggedIn = require('../middlewares/authMiddleware');


const userRouter = express.Router();
userRouter.get('/products',getAllProductForCustomer);
userRouter.get('/product/:id',getProduct);
userRouter.post('/cart',verifyLoggedIn,postCart);
userRouter.post('/wishlist/:pId/:uId',verifyLoggedIn,postWishlist);
userRouter.delete('/wishlist/:id',verifyLoggedIn,deleteWishlist);
userRouter.get('/wishlist/:pId/:uId',verifyLoggedIn,getWishlist);
userRouter.get('/wishlist/:uId',verifyLoggedIn,getUserWishlist);
userRouter.post('/review/:pId',verifyLoggedIn,postReview);
userRouter.get('/review/:pId',getReview);
userRouter.get('/cart',verifyLoggedIn,getCart);
userRouter.delete('/cart/:id',verifyLoggedIn,deleteCartItem);
userRouter.get('/category/products/:genre', getProductsByCategory);
userRouter.put('/cart/:productId',verifyLoggedIn,updateQuantity)
userRouter.put('/user/:id',verifyLoggedIn,updateUserInfo);
userRouter.post('/order',verifyLoggedIn,postOrder)
userRouter.delete('/delete/cart/:userId',verifyLoggedIn,deleteUserCart);
userRouter.get('/order/:userId',verifyLoggedIn,getAllOrders);
userRouter.put('/increase/views/:productId',increaseOrderViews);
userRouter.put('/increase/purchaseCount/:productId',increasePurchasedCount);
userRouter.get('/products/top-selling',getTopSellingProducts);


module.exports = userRouter;