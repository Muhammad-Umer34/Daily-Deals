const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/authRoutes'); 
const userRouter = require('./routes/userRoutes');
const storeRouter = require('./routes/storeRoutes');

require('dotenv').config();

const app = express();
const checkingInAdmin = (req, res, next) => {
  console.log("Admin middleware is checking in", req);
  next();
}
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true               
}));


app.use('/api/auth', authRouter);
app.use('/api/customer',userRouter);
app.use('/api/store',storeRouter);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('MongoDB error:', err));
