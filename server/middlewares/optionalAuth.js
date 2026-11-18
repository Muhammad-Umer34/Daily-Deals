// Reads the access token when one is present and carries on as a guest when it
// isn't. verifyLoggedIn rejects tokenless requests, which is right for the cart
// but wrong for the assistant: anyone may search and browse by chat.
//
// An invalid or expired token is treated as "no session" rather than an error,
// so a stale token can never 401 the chat page. (The client's axios interceptor
// logs the user out on any 401/403 mentioning a token, which would wipe the
// conversation mid-sentence.)
const jwt = require("jsonwebtoken");
require("dotenv").config();

const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    req.user = err ? null : user;
    // Lets the page renew the session instead of silently showing a logged-in
    // shopper the guest experience.
    req.sessionExpired = Boolean(err);
    next();
  });
};

module.exports = optionalAuth;
