const jwt = require("jsonwebtoken");
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const verifyAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ message: "No tokens provided" });
  }
  if (accessToken) {
    return jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
        return next();
      }
      if (refreshToken) {
        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (refreshErr, refreshUser) => {
          if (refreshErr) {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
          }
          req.user = refreshUser;
          next();
        });
      } else {
        return res.status(403).json({ message: "Invalid or expired access token" });
      }
    });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (refreshErr, refreshUser) => {
    if (refreshErr) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
    req.user = refreshUser;
    next();
  });
};

module.exports = verifyAuth;
