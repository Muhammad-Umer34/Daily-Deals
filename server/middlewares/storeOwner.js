const verifyStoreOwner = (req,res,next)=>{
  const user = req.body.user;
  if(user.userType == "storeOwner")
  {
    next();
  }
  else
  {
    res.status(401).json({message: "You are not Store Owner "});
  }
}

module.exports = verifyStoreOwner;