// Role comes from the verified JWT (set by authMiddleware), never from the request.
const verifyStoreOwner = (req, res, next) => {
  if (req.user?.userType === "storeOwner") {
    return next();
  }
  return res.status(401).json({ message: "You are not a Store Owner" });
};

module.exports = verifyStoreOwner;
