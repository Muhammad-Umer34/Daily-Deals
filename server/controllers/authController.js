const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
exports.postRegister = async (req, res, next) => {
  try {
    const { name, email, password, userType } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await new User({
      name,
      email,
      password: hashedPassword,
      userType,
    });
    await user
      .save()
      .then(() => {
        res
          .status(201)
          .json({ message: "User created successfully", user});
      })
      .catch((error) => {
        if (error.code === 11000) {
          res.status(400).json({ message: "Email already exists" });
        } else {
          res.status(500).json({ message: "Internal server error" });
        }
      });
  } catch (error) {
    next(error);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const accessToken = jwt.sign({ id: user.id, email: user.email, userType: user.userType },process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30m'});
      const refreshToken = jwt.sign({ id: user.id, email: user.email, userType: user.userType },process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'});
      console.log(accessToken);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge:7*24*60*60*1000,
      });
      res.status(200).json({ message: "Login successful", user,accessToken });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error){
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.refreshAccessToken = (req, res) => {
    const user = req.user;
  
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, userType: user.userType },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
  
    res.status(200).json({ accessToken: newAccessToken });
  };