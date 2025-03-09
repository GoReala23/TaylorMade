const Like = require('../models/likes');
const Comment = require('../models/comments');
const {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ServerError,
} = require('../errors/errors');

const likeItem = async (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  try {
    if (!itemId || !userId) {
      return next(new BadRequestError('Item ID and User ID are required'));
    }

    const existingLike = await Like.findOne({ user: userId, item: itemId });
    if (existingLike) {
      return next(new ConflictError('Item already liked'));
    }

    // Create a new like
    const like = new Like({ user: userId, item: itemId });
    await like.save();
    res.status(201).json(like);
  } catch (err) {
    next(new ServerError('An error occurred while liking the item'));
  }
};

// Unlike an item
const unlikeItem = async (req, res, next) => {
  try {
    const itemId = req.params.itemId || null;
    if (!itemId) {
      return next(new BadRequestError('Item ID is required'));
    }

    const userId = req.user ? req.user.id : null;
    if (!userId) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    const result = await Like.deleteOne({ item: itemId, user: userId });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Item unliked successfully' });
    } else {
      next(new NotFoundError('No like found for this item'));
    }
  } catch (error) {
    next(new ServerError('An error occurred while unliking the item'));
  }
};

const likeComment = async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user?.id;

  try {
    if (!commentId) {
      return next(new BadRequestError('Comment ID is required'));
    }
    if (!userId) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    const existingLike = await Like.findOne({
      user: userId,
      comment: commentId,
    });
    if (existingLike) {
      return next(new ConflictError('Comment already liked'));
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(new NotFoundError('Comment not found'));
    }

    const like = new Like({
      user: userId,
      comment: commentId,
      item: comment.item,
    });
    await like.save();
    res.status(201).json(like);
  } catch (err) {
    console.error('Error in likeComment:', err);
    next(new ServerError('An error occurred while liking the comment'));
  }
};

const unlikeComment = async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const deletedLike = await Like.findOneAndDelete({
      user: userId,
      comment: commentId,
    });
    if (!deletedLike) {
      return next(new NotFoundError('Like not found'));
    }
    res.json({ message: 'Like deleted' });
  } catch (err) {
    next(new ServerError('An error occurred while unliking the comment'));
  }
};
module.exports = { likeItem, unlikeItem, likeComment, unlikeComment };
