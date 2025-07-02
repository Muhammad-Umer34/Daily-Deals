const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/authRoutes'); 
const userRouter = require('./routes/userRoutes');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true               
}));


app.use((req, res, next) => {
  console.log("METHOD:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("HEADERS:", req.headers);
  console.log("BODY:", req.body);
  console.log("QUERY:", req.query);
  next();
});

console.log("Server is running in", process.env.NODE_ENV, "mode");
app.use('/api/auth', authRouter);
app.use('/api/user',userRouter);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('MongoDB error:', err));
