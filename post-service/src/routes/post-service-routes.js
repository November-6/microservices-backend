const express = require("express");
const {
  createPost,
  deletePost,
  commentOnPost,
} = require("../controllers/post-controllers");

const router = express.Router();

router.post("/", createPost);

router.delete("/:postId", deletePost);

router.post("/comment", commentOnPost);

module.exports = router;
