const express= require("express");

const verifyLoggedIn = require('../middlewares/authMiddleware');
const verifyStoreOwner = require('../middlewares/storeOwner.js');



const storeRouter = express.Router();

storeRouter.post("/products",verifyLoggedIn,verifyStoreOwner);
storeRouter.put("/products/:id",verifyLoggedIn,verifyStoreOwner);
storeRouter.delete("/products/:id",verifyLoggedIn,verifyStoreOwner);
storeRouter.get("/products",verifyLoggedIn,verifyStoreOwner);
