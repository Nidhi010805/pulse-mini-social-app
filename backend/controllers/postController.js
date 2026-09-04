const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');

// Uploads an image buffer (from multer memory storage) to Cloudinary
// and resolves with the secure URL. Wrapped in a promise since the
// Cloudinary SDK's upload_stream uses a callback API.
const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'mini-social-posts', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// @desc    Get paginated feed of all posts, newest first
// @route   GET /api/posts?page=1&limit=10
// @access  Private
const getPosts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(),
    ]);

    const totalPages = Math.max(Math.ceil(totalPosts / limit), 1);

    res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      data: { posts },
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new post (text, image, or both)
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const text = (req.body.text || '').trim();
    let imageUrl = '';

    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Only JPG, JPEG, PNG, and WEBP images are allowed',
        });
      }
      imageUrl = await uploadBufferToCloudinary(req.file.buffer);
    }

    if (!text && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot be empty. Add text or an image.',
      });
    }

    const post = await Post.create({
      user: req.user._id,
      username: req.user.username,
      text,
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like or unlike a post (toggle)
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id.toString();
    const existingLikeIndex = post.likes.findIndex((like) => like.user.toString() === userId);

    let liked;
    if (existingLikeIndex > -1) {
      post.likes.splice(existingLikeIndex, 1);
      liked = false;
    } else {
      post.likes.push({ user: req.user._id, username: req.user.username });
      liked = true;
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: liked ? 'Post liked' : 'Post unliked',
      data: {
        postId: post._id,
        liked,
        likesCount: post.likes.length,
        likes: post.likes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      username: req.user.username,
      text,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: {
        postId: post._id,
        commentsCount: post.comments.length,
        comments: post.comments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post (only the post's owner)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    res.status(200).json({ success: true, message: 'Post deleted successfully', data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPosts, createPost, toggleLike, addComment, deletePost };
