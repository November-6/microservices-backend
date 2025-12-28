const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // MOTHERFUCKER WHY IS IT NOT Authorization ITS THAT IN POSTMAN I SPENT 20 MINS ON THIS 
  if (!authHeader){
    logger.warn("No Auth Header")
  }
  const token = authHeader 
  logger.warn(token)
  
  if (!token) {
    logger.warn("Access attempt without valid token!");
    return res.status(401).json({
      message: "Authentication required",
      success: false,
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn("Invalid token!");
      return res.status(429).json({
        message: "Invalid token!",
        success: false,
      });
    }

    req.user = user;
    next();
  });
};

module.exports = { validateToken };