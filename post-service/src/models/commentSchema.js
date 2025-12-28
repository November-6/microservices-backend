const mongoose = require('mongoose');
// import { Filter } from 'bad-words'

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'postModel',
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel',
    required: true,
  },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
}, { timestamps: true });



// commentSchema.pre('save', async function (next) {
//   if (filter.isProfane(this.content)) {
//     logger.error('Comment contains inappropriate language');
//     throw new Error('Comment contains inappropriate language');
//   }
// })

const commentModel = mongoose.model('Comment', commentSchema);
module.exports = commentModel;


//access token 
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTRlZmZkZTk1Mzk3ZmU2MmRjNWY3NTgiLCJ1c2VybmFtZSI6Im5ld1VzZXJOYW1lMTIzIiwiaWF0IjoxNzY2OTU4MzQ4LCJleHAiOjE3NjY5NTk4NDh9.RI7obEIdV2SGaUyJSP1kCvgrvGJIoz-vlPVcezDffc4