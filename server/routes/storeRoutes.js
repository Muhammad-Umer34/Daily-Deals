const express= require("express");

const verifyLoggedIn = require('../middlewares/authMiddleware');
const verifyStoreOwner = require('../middlewares/storeOwner.js');
const { postProductController,getProductsController,deleteProductController ,updateProductController,postStoreOrder,getStoreOrdersController,getOrderDetailsController,dispatchOrder,getDashboardData} = require('../controllers/storeController.js');

const storeRouter = express.Router();

storeRouter.post("/products",verifyLoggedIn,verifyStoreOwner, postProductController);
storeRouter.put("/products/:id",verifyLoggedIn,verifyStoreOwner, updateProductController);
storeRouter.delete("/products/:id",verifyLoggedIn,verifyStoreOwner, deleteProductController);
storeRouter.get("/products",verifyLoggedIn,verifyStoreOwner, getProductsController);
storeRouter.post("/orders", postStoreOrder);
storeRouter.get("/orders",verifyLoggedIn,verifyStoreOwner,getStoreOrdersController);
storeRouter.get("/orders/:id",verifyLoggedIn,verifyStoreOwner,getOrderDetailsController);
storeRouter.put("/orders/dispatch/:id",verifyLoggedIn,verifyStoreOwner,dispatchOrder);
storeRouter.get("/dashboard/:id",verifyLoggedIn,verifyStoreOwner,getDashboardData)

module.exports = storeRouter;