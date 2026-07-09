const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

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

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    // Generate 6-digit random PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinExpires = Date.now() + 15 * 60 * 1000; // expires in 15 mins

    // Store in User document
    user.resetPasswordPin = pin;
    user.resetPasswordPinExpires = pinExpires;
    await user.save();

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Daily Deals Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Daily Deals Password Reset Verification PIN",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
          <h2 style="color: #3b82f6; text-align: center; margin-bottom: 20px;">Daily Deals Password Reset</h2>
          <p style="color: #334155; font-size: 16px;">Hello <strong>${user.name || "User"}</strong>,</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">You requested to reset your password. Use the following verification PIN to reset it:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; background-color: #f1f5f9; padding: 15px; letter-spacing: 5px; border-radius: 8px; margin: 20px 0; color: #1e293b; border: 1px solid #e2e8f0;">
            ${pin}
          </div>
          <p style="color: #ef4444; font-size: 14px; text-align: center;"><strong>Note:</strong> This PIN will expire in 15 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Verification PIN sent to email successfully" });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, pin, newPassword } = req.body;
  try {
    if (!email || !pin || !newPassword) {
      return res.status(400).json({ message: "Email, pin, and new password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    // Check PIN and Expiration
    if (!user.resetPasswordPin || user.resetPasswordPin !== pin || !user.resetPasswordPinExpires || user.resetPasswordPinExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired verification PIN" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save user password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordPin = null;
    user.resetPasswordPinExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now login." });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
