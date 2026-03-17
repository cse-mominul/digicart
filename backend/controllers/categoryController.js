const mongoose = require('mongoose');
const Category = require('../models/Category');

// @desc  Get all active categories
// @route GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Create a category (admin only)
// @route POST /api/categories
const createCategory = async (req, res) => {
  const { name, iconUrl, isActive } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const existingCategory = await Category.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      iconUrl: typeof iconUrl === 'string' ? iconUrl.trim() : '',
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Update a category (admin only)
// @route PUT /api/categories/:id
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, iconUrl, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid category id' });
  }

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (typeof name === 'string' && name.trim()) {
      const duplicate = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
      });

      if (duplicate) {
        return res.status(400).json({ message: 'Category name already in use' });
      }

      category.name = name.trim();
    }

    if (typeof isActive === 'boolean') {
      category.isActive = isActive;
    }

    if (typeof iconUrl === 'string') {
      category.iconUrl = iconUrl.trim();
    }

    const updatedCategory = await category.save();
    return res.json(updatedCategory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a category (admin only)
// @route DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid category id' });
  }

  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({ message: 'Category removed' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
