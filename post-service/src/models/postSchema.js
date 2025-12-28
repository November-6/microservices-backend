const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: {
      type: String,
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: "Content cannot be empty",
      },
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: true,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "commentModel",
      },
    ],
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    mediaUrls: [{ type: String, default: [] }],
  },
  { timestamps: true }
);

postSchema.index({ title: "text", content: "text" });

// postSchema.pre('save', async function (next) {
//   if (!this.content || this.content.trim().length === 0) {
//     logger.error('Post content cannot be empty');
//     return next(new Error('Content cannot be empty'));
//   }
// });
// replaced this function with validator in content field itself

const postModel = mongoose.model("Post", postSchema);
module.exports = postModel;
