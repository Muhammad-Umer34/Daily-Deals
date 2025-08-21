const express= require("express");

const verifyLoggedIn = require('../middlewares/authMiddleware');
const verifyStoreOwner = require('../middlewares/storeOwner.js');
const { postProductController,getProductsController,deleteProductController ,updateProductController,postStoreOrder} = require('../controllers/storeController.js');


const storeRouter = express.Router();

storeRouter.post("/products",verifyLoggedIn,verifyStoreOwner, postProductController);
storeRouter.put("/products/:id",verifyLoggedIn,verifyStoreOwner, updateProductController);
storeRouter.delete("/products/:id",verifyLoggedIn,verifyStoreOwner, deleteProductController);
storeRouter.get("/products",verifyLoggedIn,verifyStoreOwner, getProductsController);
storeRouter.post("/orders", postStoreOrder);


module.exports = storeRouter;