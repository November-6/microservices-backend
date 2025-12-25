const userModel = require("../models/user-schema");
const logger = require("../utils/logger");
const { validateRegistration } = require("../utils/validation");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res) => {
  logger.info("Registration request received for user: %s", req.body.username);
  try {
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn(
        "Validation failed for user: %s, error: %s",
        req.body.username,
        error.details[0].message
      );
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, username, password } = req.body;

    let user = await userModel.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn(
        "Registration attempt with existing email or username: %s",
        email || username
      );
      return res
        .status(409)
        .json({ message: "Email or Username already in use" });
    }

    user = new userModel({ username, email, passwordHash: password });
    await user.save();

    const { accessToken, refreshToken } = await generateToken(user);

    logger.info("User registered successfully: %s", username);
    res.status(201).json({
      message: "User registered successfully",
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (e) {}
};


module.exports = { registerUser };