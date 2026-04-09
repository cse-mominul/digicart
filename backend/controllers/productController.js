const Product = require('../models/Product');
const Order = require('../models/Order');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc  Get all products
// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (typeof category === 'string' && category.trim()) {
      const normalizedCategory = decodeURIComponent(category.trim()).replace(/-/g, ' ');
      query.category = { $regex: `^${escapeRegex(normalizedCategory)}$`, $options: 'i' };
    }

    if (typeof search === 'string' && search.trim()) {
      const searchTerm = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const hasPaginationQuery = req.query.page != null || req.query.limit != null;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));

    if (!hasPaginationQuery) {
      const products = await Product.find(query).sort({ createdAt: -1 });
      return res.json(products);
    }

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      products,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single product by ID
// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get top selling products
// @route GET /api/products/top-selling
const getTopSellingProducts = async (req, res) => {
  try {
    const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));

    const products = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          soldCount: { $sum: '$items.quantity' },
        },
      },
      { $sort: { soldCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: Product.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: '$product._id',
          name: '$product.name',
          description: '$product.description',
          price: '$product.price',
          image: '$product.image',
          category: '$product.category',
          countInStock: '$product.countInStock',
          stock: '$product.stock',
          additionalInfo: '$product.additionalInfo',
          createdAt: '$product.createdAt',
          soldCount: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create a product (admin only)
// @route POST /api/products
const createProduct = async (req, res) => {
  const { name, description, price, image, category, stock, countInStock, additionalInfo } = req.body;

  if (!name || !description || !price || !image || !category) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const product = await Product.create({
      name,
      description,
      price,
      image,
      category,
      stock,
      countInStock,
      additionalInfo,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update a product (admin only)
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a product (admin only)
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProductById, getTopSellingProducts, createProduct, updateProduct, deleteProduct };
