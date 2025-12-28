const logger = require("../utils/logger");

const userContext = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    logger.warn("Missing x-user-id header");
    return res.status(401).json({
      error: "User context missing"
    });
  }

  req.user = { userId };
  next();
};

module.exports = userContext;
