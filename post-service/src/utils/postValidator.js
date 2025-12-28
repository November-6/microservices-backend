const joi = require("joi");
const logger = require("./logger");

const validatePost = (data) => {
  const schema = joi.object({
    title: joi.string().min(3).max(100).required(),
    content: joi.string().min(10).required(),
  });

  return schema.validate(data);
}

const validateComment = (data) => {
  const schema = joi.object({
    postId: joi.string(),
    content: joi.string().min(1).max(500).required(),
  });
  return schema.validate(data);
}

module.exports = { validatePost, validateComment };