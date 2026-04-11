const Order = require('../models/Order');
const User = require('../models/User');
const UserEngagement = require('../models/UserEngagement');
const Product = require('../models/Product');

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

module.exports = { getAbandonedCartInsights };
