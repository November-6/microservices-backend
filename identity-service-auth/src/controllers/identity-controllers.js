const userModel = require("../models/user-schema");
const logger = require("../utils/logger");
const { validateRegistration, validateLogin } = require("../utils/validation");
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
  } catch (e) {
    logger.error("Registration error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  logger.info("login request received for user: %s", req.body.data);

  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn(
        "Validation failed for login data: %s, error: %s",
        req.body.data,
        error.details[0].message
      );
      return res.status(400).json({ message: error.details[0].message });
    }

    const { data, password } = req.body;

    const user = await userModel.findOne({
      $or: [{ email: data }, { username: data }],
    });
    if (!user) {
      logger.warn(
        "Login attempt with non-existing email or username: %s",
        data
      );
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ik its not the best way but i really wanted to do this so...
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn("Login attempt with incorrect password for user: %s", data);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const { accessToken, refreshToken } = await generateToken(user);

    logger.info("User logged in successfully: %s", data);
    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (e) {
    logger.error("login error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


//TODO - implement logout and refresh token controllers, for now this functionalty is working without them but its not secure at all

//NOTE - Also I can make this look a little better by sepearting controllers into their own js files which also ill do later, also it avoids the bracket hellscape going on here


module.exports = { registerUser, loginUser };
