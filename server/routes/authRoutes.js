const express = require('express');

const {customerPostRegister,storePostRegister,postLogin,refreshAccessToken} = require('../controllers/authController.js')
const verifyRefreshToken = require('../middlewares/verifyRefreshToken.js')

const authRouter = express.Router();

authRouter.post('/register/customer', customerPostRegister);
authRouter.post('/register/store', storePostRegister);
authRouter.post('/login',postLogin);
authRouter.post('/refresh',verifyRefreshToken,refreshAccessToken);

module.exports = authRouter;