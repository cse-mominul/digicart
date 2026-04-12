const Expense = require('../models/Expense');

// @desc  Get all expenses (admin)
// @route GET /api/admin/expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({})
      .sort({ expenseDate: -1, createdAt: -1 })
      .populate('createdBy', 'name email');

    return res.json(expenses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Create expense (admin)
// @route POST /api/admin/expenses
const createExpense = async (req, res) => {
  try {
    const title = String(req.body?.title || '').trim();
    const category = String(req.body?.category || 'other').trim().toLowerCase();
    const amount = Number(req.body?.amount);
    const note = String(req.body?.note || '').trim();
    const expenseDate = req.body?.expenseDate ? new Date(req.body.expenseDate) : new Date();

    if (!title) {
      return res.status(400).json({ message: 'Expense title is required' });
    }

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ message: 'Expense amount must be a valid non-negative number' });
    }

    if (Number.isNaN(expenseDate.getTime())) {
      return res.status(400).json({ message: 'Expense date is invalid' });
    }

    const expense = await Expense.create({
      title,
      category: category || 'other',
      amount,
      note,
      expenseDate,
      createdBy: req.user?._id || null,
    });

    return res.status(201).json(expense);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Delete expense (admin)
// @route DELETE /api/admin/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.deleteOne();
    return res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
};
