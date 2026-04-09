const express = require('express');
const router = express.Router();
const {
  getCategories,
  getAllCategories,
  getRandomCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', getCategories);
router.get('/random', getRandomCategories);
router.get('/all', protect, requireAdmin, getAllCategories);
router.post('/', protect, requireAdmin, createCategory);
router.put('/:id', protect, requireAdmin, updateCategory);
router.delete('/:id', protect, requireAdmin, deleteCategory);

module.exports = router;
