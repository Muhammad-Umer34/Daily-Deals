const express= require("express");

const verifyLoggedIn = require('../middlewares/authMiddleware');
const verifyStoreOwner = require('../middlewares/storeOwner.js');
const { postProductController } = require('../controllers/storeController.js');

const storeRouter = express.Router();

storeRouter.post("/products",verifyLoggedIn,verifyStoreOwner, postProductController);
storeRouter.put("/products/:id",verifyLoggedIn,verifyStoreOwner);
storeRouter.delete("/products/:id",verifyLoggedIn,verifyStoreOwner);
storeRouter.get("/products",verifyLoggedIn,verifyStoreOwner);


module.exports = storeRouter;