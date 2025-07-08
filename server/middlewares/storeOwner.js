const verifyStoreOwner = (req, res, next) => {
  const userTypeFromBody = req.body?.user?.userType;
  const userTypeFromQuery = req.query?.userType;

  if (userTypeFromBody === "storeOwner" || userTypeFromQuery === "storeOwner") {
    return next();
  }

  return res.status(401).json({ message: "You are not a Store Owner" });
};

module.exports = verifyStoreOwner;
