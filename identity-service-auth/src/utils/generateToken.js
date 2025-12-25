// generates the token required for authentication

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const refreshTokenModel = require("../models/token-schema");

const generateToken = async (user, expiresIn = "25m") => {
  const accessToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await refreshTokenModel.create({
    token: refreshToken,
    userId: user._id,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

module.exports = generateToken;
