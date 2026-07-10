const express = require('express');

const {customerPostRegister,storePostRegister,postLogin,refreshAccessToken,forgotPassword,resetPassword,postSocialLogin} = require('../controllers/authController.js')
const verifyRefreshToken = require('../middlewares/verifyRefreshToken.js')

const authRouter = express.Router();

authRouter.post('/register/customer', customerPostRegister);
authRouter.post('/register/store', storePostRegister);
authRouter.post('/login',postLogin);
authRouter.post('/social-login', postSocialLogin);
authRouter.post('/refresh',verifyRefreshToken,refreshAccessToken);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

module.exports = authRouter;