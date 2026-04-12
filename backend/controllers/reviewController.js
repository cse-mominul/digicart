const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

const getUserIdFromRequest = (req) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || null;
  } catch {
    return null;
  }
};

const hasPurchasedProduct = async (userId, productId) => {
  const productObjectId = new mongoose.Types.ObjectId(productId);

  return Boolean(
    await Order.exists({
      user: userId,
      status: { $in: ['Delivered', 'Completed'] },
      items: { $elemMatch: { product: productObjectId } },
    })
  );
};

// @desc  Get logged-in user's reviews
// @route GET /api/products/my-reviews
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name image category price')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductReviewPayload = async (productId, currentUserId = null) => {
  const productObjectId = new mongoose.Types.ObjectId(productId);

  const [summary, reviews, currentUserReview] = await Promise.all([
    Review.aggregate([
      { $match: { product: productObjectId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]),
    Review.find({ product: productObjectId })
      .populate('user', 'name')
      .sort({ createdAt: -1 }),
    currentUserId
      ? Review.findOne({ product: productObjectId, user: currentUserId })
      : null,
  ]);

  const meta = summary[0] || {};

  return {
    reviews,
    averageRating: meta.totalReviews ? Number(meta.averageRating.toFixed(1)) : 0,
    totalReviews: meta.totalReviews || 0,
    currentUserReview,
    canReview: currentUserId ? await hasPurchasedProduct(currentUserId, productId) : false,
  };
};

// @desc  Get reviews for a product
// @route GET /api/products/:id/reviews
const getProductReviews = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id).select('_id');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const currentUserId = getUserIdFromRequest(req);
    const reviewPayload = await getProductReviewPayload(req.params.id, currentUserId);

    res.json(reviewPayload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create or update a product review
// @route POST /api/products/:id/reviews
const createOrUpdateProductReview = async (req, res) => {
  const { rating, comment, image } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  if (!rating || Number.isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ message: 'Please provide a rating between 1 and 5' });
  }

  if (!comment || !String(comment).trim()) {
    return res.status(400).json({ message: 'Please write a review comment' });
  }

  try {
    const product = await Product.findById(req.params.id).select('_id');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const canReview = await hasPurchasedProduct(req.user._id, req.params.id);
    if (!canReview) {
      return res.status(403).json({ message: 'You can only review products you have ordered' });
    }

    const review = await Review.findOneAndUpdate(
      { product: req.params.id, user: req.user._id },
      {
        rating: Number(rating),
        comment: String(comment).trim(),
        image: String(image || '').trim(),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('user', 'name');

    const reviewPayload = await getProductReviewPayload(req.params.id, req.user._id);

    res.status(201).json({
      message: 'Review saved successfully',
      review,
      ...reviewPayload,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all reviews (admin only)
// @route GET /api/admin/reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('product', 'name image category')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update a review (admin only)
// @route PUT /api/admin/reviews/:id
const updateReviewByAdmin = async (req, res) => {
  const { rating, comment, image } = req.body;

  if (rating != null) {
    const parsed = Number(rating);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
  }

  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (rating != null) {
      review.rating = Number(rating);
    }

    if (comment != null) {
      const trimmedComment = String(comment).trim();
      if (!trimmedComment) {
        return res.status(400).json({ message: 'Comment is required' });
      }
      review.comment = trimmedComment;
    }

    if (image != null) {
      review.image = String(image).trim();
    }

    const updated = await review.save();
    await updated.populate('user', 'name email');
    await updated.populate('product', 'name image category');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a review (admin only)
// @route DELETE /api/admin/reviews/:id
const deleteReviewByAdmin = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc  Delete logged-in user's review for a product
// @route DELETE /api/products/:id/reviews/me
const deleteMyProductReview = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const deleted = await Review.findOneAndDelete({
      product: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Review not found for this product' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyReviews,
  getProductReviews,
  createOrUpdateProductReview,
  deleteMyProductReview,
  getAllReviews,
  updateReviewByAdmin,
  deleteReviewByAdmin,
};