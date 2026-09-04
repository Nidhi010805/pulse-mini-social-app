const mongoose = require('mongoose');

// Likes and comments are embedded directly inside the Post document.
// The app intentionally uses only two collections: users and posts.
const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    text: { type: String, trim: true, maxlength: 2000, default: '' },
    image: { type: String, default: '' },
    likes: { type: [likeSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

// A post must contain text or an image (validated again in the controller,
// this is a defense-in-depth check at the schema level).
postSchema.pre('validate', function (next) {
  const hasText = this.text && this.text.trim().length > 0;
  const hasImage = this.image && this.image.trim().length > 0;
  if (!hasText && !hasImage) {
    return next(new Error('Post must contain text or an image'));
  }
  next();
});

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
