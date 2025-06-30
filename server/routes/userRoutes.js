const express = require('express');

const verifyLoggedIn = require('../middlewares/authMiddleware')

const userRouter = express.Router();
userRouter.get('/profile',verifyLoggedIn,(req,res,next)=>{
    res.send('Profile route');
});

module.exports = userRouter;