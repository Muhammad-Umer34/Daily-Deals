const express = require('express');

const {postRegister,postLogin,refreshAccessToken} = require('../controllers/authController.js')
const verifyRefreshToken = require('../middlewares/verifyRefreshToken.js')

const authRouter = express.Router();

authRouter.post('/register', postRegister);
authRouter.post('/login',postLogin);
authRouter.post('/refresh',verifyRefreshToken,refreshAccessToken);

module.exports = authRouter;