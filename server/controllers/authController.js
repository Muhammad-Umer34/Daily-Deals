const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

require("dotenv").config();

const User = require("../models/user");

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

exports.customerPostRegister = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  check("email")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email already in use");
      }
      return true;
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  check("userType")
    .optional()
    .isIn(["storeOwner", "customer"])
    .withMessage("User type must be either 'storeOwner' or 'customer'"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {  
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, userType } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        userType: userType || "customer",
        address: [],
        phoneNumber: [],
      });

      await newUser.save();

      const safeUser = {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        userType: newUser.userType,
      };

      res.status(201).json({ message: "User registered successfully", user: safeUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
];

exports.storePostRegister = [
  check("name")
    .notEmpty()
    .withMessage("Owner name is required")
    .isLength({ min: 3 })
    .withMessage("Owner name must be at least 3 characters long"),

  check("email")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email already in use");
      }
      return true;
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  check("brand_name")
    .notEmpty()
    .withMessage("Brand name is required"),

  check("brand_logo")
    .notEmpty()
    .withMessage("Brand logo URL is required")
    .isURL()
    .withMessage("Brand logo must be a valid URL"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log("Request body:", req.body);
      const { name, email, password, brand_name, brand_logo } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        userType: "storeOwner",
        brand_name: brand_name,
        brand_logo: brand_logo,
      });

      await newUser.save();

      const safeUser = {
        id: newUser._id,
        email: newUser.email,
        ownerName: newUser.ownerName,
        brand_name: newUser.brand_name,
        brand_logo: newUser.brand_logo,
        userType: newUser.userType,
      };

      res.status(201).json({ message: "Store owner registered successfully", user: safeUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
];

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, userType: user.userType },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );
     
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email, userType: user.userType },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );
console.log("Refresh Token is ",refreshToken);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name || user.ownerName,
          email: user.email,
          userType: user.userType,
          brand_name: user.brand_name || null,
          brand_logo: user.brand_logo || null,
          address: user.address || null,
          phoneNumber: user.phoneNumber || null,
        },
        accessToken,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
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
