// validates our data for identity controllers

const joi = require("joi");
const logger = require("../utils/logger");

const validateRegistration = (data) => {
  const schema = joi.object({
    username: joi.string().alphanum().min(3).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
  });

  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = joi.object({
    data: joi.string().required(),
    password: joi.string().required(),
  });

  return schema.validate(data);
};

module.exports = { validateRegistration, validateLogin };
