const postModel = require("../models/postSchema");
const { validateComment, validatePost } = require("../utils/postValidator");
const logger = require("../utils/logger");
const commentModel = require("../models/commentSchema");

const createPost = async (req, res) => {
  logger.info("newPost endpoint hit");
  try {
    const { title, content } = req.body;
    // I dont need to verify authorID here as this route WILL be protected by middlewares in api-gateway which will only allow verified jwt tokens to access this route
    const error = validatePost({ title, content }).error;

    logger.warn(title, content)
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    logger.info("reached here")

    const postData = {
      title,
      content,
      authorId: req.user.userId,
    };

    const newPost = await postModel.create(postData);
    logger.info(`Post created with ID: ${newPost._id}`);

    return res.status(201).json({
      id: newPost._id,
      title: newPost.title,
      content: newPost.content,
      authorId: newPost.authorId,
      createdAt: newPost.createdAt,
    });

  } catch (err) {
    logger.error("Error creating post: ", err);
    return res.status(500).json({ error: "Error Here Now" });
  }
};

const deletePost = async (req, res) => {
  logger.info("deletePost endpoint hit");

  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const deletedPost = await postModel.findOneAndDelete({
      _id: postId,
      authorId: userId,
    });

    if (!deletedPost) {
      logger.warn(
        `Unauthorized or missing post. Post ID: ${postId}, User ID: ${userId}`
      );
      return res.status(403).json({
        error: "Not authorized to delete this post or post not found",
      });
    }
    logger.info(`Post ${postId} deleted by user ${userId}`);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    logger.error("Error deleting post:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//TODO - Implement This
const updatePost = (req, res) => {};

/* -------------------------------------------------------------------------- */
/*                                   actions                                  */
/* -------------------------------------------------------------------------- */

const commentOnPost = async (req, res) => {
  logger.info("commentOnPost endpoint hit");

  try {
    const { postId, content } = req.body;

    const error = validateComment({ postId, content }).error;
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const post = await postModel.findById(postId);
    if (!post) {
      logger.warn(`Post ${postId} not found for commenting`);
      return res.status(404).json({ error: "Post not found" });
    }

    const newComment = await commentModel.create({
      postId,
      content,
      authorId: req.user.userId,
    });

    //NOTE - my dumbass kept forgetting this 
    post.comments.push(newComment._id);
    await post.save();

    logger.info(`Comment ${newComment._id} added to Post ${postId}`);

    return res.status(201).json({
      id: newComment._id,
      postId,
      content: newComment.content,
      authorId: newComment.authorId,
      createdAt: newComment.createdAt,
    });
  } catch (err) {
    logger.error("Error commenting on post:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const likePost = (req, res) => {};

const dislikePost = (req, res) => {};

const sharePost = (req, res) => {};


module.exports = {createPost, commentOnPost, deletePost}