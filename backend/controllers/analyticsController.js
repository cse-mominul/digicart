const Order = require('../models/Order');
const User = require('../models/User');
const UserEngagement = require('../models/UserEngagement');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc  Get abandoned cart insights (admin)
// @route GET /api/admin/abandoned-carts
const getAbandonedCartInsights = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const search = String(req.query.search || '').trim().toLowerCase();

    const engagements = await UserEngagement.find({
      $or: [
        { cartProductIds: { $exists: true, $ne: [] } },
        { wishlistProductIds: { $exists: true, $ne: [] } },
      ],
    }).lean();

    if (!engagements.length) {
      return res.json({
        abandonedUsers: 0,
        abandonedItems: 0,
        users: [],
        page,
        limit,
        pages: 1,
        total: 0,
      });
    }

    const userIds = engagements.map((item) => item.user);

    const [orders, users] = await Promise.all([
      Order.find({ user: { $in: userIds } }).select('user items.product').lean(),
      User.find({ _id: { $in: userIds } }).select('name email').lean(),
    ]);

    const purchasedByUser = new Map();
    orders.forEach((order) => {
      const key = String(order.user);
      if (!purchasedByUser.has(key)) {
        purchasedByUser.set(key, new Set());
      }

      const target = purchasedByUser.get(key);
      (order.items || []).forEach((item) => {
        if (item?.product) {
          target.add(String(item.product));
        }
      });
    });

    const userMap = new Map(users.map((user) => [String(user._id), user]));

    const abandonedUsers = [];
    let abandonedItems = 0;
    const unresolvedProductIds = new Set();

    engagements.forEach((entry) => {
      const userId = String(entry.user);
      const purchased = purchasedByUser.get(userId) || new Set();

      const tracked = new Set([
        ...(entry.cartProductIds || []).map((id) => String(id)),
        ...(entry.wishlistProductIds || []).map((id) => String(id)),
      ]);

      const unresolved = Array.from(tracked).filter((productId) => !purchased.has(productId));
      if (!unresolved.length) return;

      unresolved.forEach((productId) => unresolvedProductIds.add(productId));
      abandonedItems += unresolved.length;

      const userInfo = userMap.get(userId);
      abandonedUsers.push({
        userId,
        name: userInfo?.name || 'Unknown User',
        email: userInfo?.email || '',
        cartCount: (entry.cartProductIds || []).length,
        wishlistCount: (entry.wishlistProductIds || []).length,
        unresolvedCount: unresolved.length,
        unresolvedProductIds: unresolved,
        lastActiveAt: entry.lastActiveAt || entry.updatedAt,
      });
    });

    const productDocs = await Product.find({ _id: { $in: Array.from(unresolvedProductIds) } })
      .select('name image category')
      .lean();

    const productMap = new Map(productDocs.map((product) => [String(product._id), product]));

    const usersWithProducts = abandonedUsers.map((entry) => {
      const unresolvedProducts = (entry.unresolvedProductIds || [])
        .map((productId) => {
          const product = productMap.get(productId);
          if (!product) return null;

          return {
            _id: String(product._id),
            name: product.name,
            image: product.image,
            category: product.category,
          };
        })
        .filter(Boolean);

      return {
        ...entry,
        unresolvedProducts,
      };
    });

    const searchedUsers = !search
      ? usersWithProducts
      : usersWithProducts.filter((entry) => {
        const userText = `${entry.name} ${entry.email}`.toLowerCase();
        const productText = (entry.unresolvedProducts || [])
          .map((product) => `${product.name} ${product.category}`)
          .join(' ')
          .toLowerCase();
        return userText.includes(search) || productText.includes(search);
      });

    searchedUsers.sort((a, b) => {
      const aTime = new Date(a.lastActiveAt || 0).getTime();
      const bTime = new Date(b.lastActiveAt || 0).getTime();
      return bTime - aTime;
    });

    const total = searchedUsers.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, pages);
    const start = (safePage - 1) * limit;
    const paginatedUsers = searchedUsers.slice(start, start + limit);

    return res.json({
      abandonedUsers: usersWithProducts.length,
      abandonedItems,
      users: paginatedUsers,
      page: safePage,
      limit,
      pages,
      total,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Get abandoned cart details by user (admin)
// @route GET /api/admin/abandoned-carts/:userId
const getAbandonedCartDetailsByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const [engagement, user, orders] = await Promise.all([
      UserEngagement.findOne({ user: userId }).lean(),
      User.findById(userId).select('name email phone role createdAt lastLoginAt').lean(),
      Order.find({ user: userId }).select('items.product createdAt').lean(),
    ]);

    if (!engagement) {
      return res.status(404).json({ message: 'Abandoned cart entry not found' });
    }

    const cartIds = (engagement.cartProductIds || []).map((id) => String(id));
    const wishlistIds = (engagement.wishlistProductIds || []).map((id) => String(id));

    const purchasedIds = new Set();
    (orders || []).forEach((order) => {
      (order.items || []).forEach((item) => {
        if (item?.product) {
          purchasedIds.add(String(item.product));
        }
      });
    });

    const trackedIds = new Set([...cartIds, ...wishlistIds]);
    const unresolvedIds = Array.from(trackedIds).filter((id) => !purchasedIds.has(id));

    const allProductIds = Array.from(new Set([...trackedIds, ...purchasedIds]));
    const products = await Product.find({ _id: { $in: allProductIds } })
      .select('name image category brand price stock')
      .lean();

    const productMap = new Map(products.map((product) => [String(product._id), product]));

    const mapProducts = (ids) => ids
      .map((id) => {
        const product = productMap.get(String(id));
        if (!product) return null;

        return {
          _id: String(product._id),
          name: product.name,
          image: product.image,
          category: product.category,
          brand: product.brand,
          price: product.price,
          stock: product.stock,
        };
      })
      .filter(Boolean);

    const purchasedProductIds = Array.from(purchasedIds);

    return res.json({
      user: user
        ? {
          _id: String(user._id),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        }
        : {
          _id: String(userId),
          name: 'Unknown User',
          email: '',
          phone: '',
          role: 'user',
          createdAt: null,
          lastLoginAt: null,
        },
      insight: {
        cartCount: cartIds.length,
        wishlistCount: wishlistIds.length,
        purchasedCount: purchasedProductIds.length,
        unresolvedCount: unresolvedIds.length,
        lastActiveAt: engagement.lastActiveAt || engagement.updatedAt,
        updatedAt: engagement.updatedAt,
        createdAt: engagement.createdAt,
      },
      cartProducts: mapProducts(cartIds),
      wishlistProducts: mapProducts(wishlistIds),
      unpurchasedProducts: mapProducts(unresolvedIds),
      purchasedProducts: mapProducts(purchasedProductIds),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Resolve abandoned cart entry (admin)
// @route PUT /api/admin/abandoned-carts/:userId
const resolveAbandonedCartByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const engagement = await UserEngagement.findOne({ user: userId });
    if (!engagement) {
      return res.status(404).json({ message: 'Abandoned cart entry not found' });
    }

    engagement.cartProductIds = [];
    engagement.wishlistProductIds = [];
    engagement.lastActiveAt = new Date();
    await engagement.save();

    return res.json({ message: 'Abandoned cart resolved successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Delete abandoned cart entry (admin)
// @route DELETE /api/admin/abandoned-carts/:userId
const deleteAbandonedCartByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const engagement = await UserEngagement.findOneAndDelete({ user: userId });
    if (!engagement) {
      return res.status(404).json({ message: 'Abandoned cart entry not found' });
    }

    return res.json({ message: 'Abandoned cart entry deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAbandonedCartInsights,
  getAbandonedCartDetailsByAdmin,
  resolveAbandonedCartByAdmin,
  deleteAbandonedCartByAdmin,
};
