const Order = require('../models/Order');

// @desc  Create new order
// @route POST /api/orders
const createOrder = async (req, res) => {
  const { items, totalAmount, shippingAddress, customer, appliedCoupon } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }

  const profilePhone = String(req.user?.phone || '').trim();
  if (!profilePhone) {
    return res.status(400).json({ message: 'Please add your phone number in Profile Information before placing an order' });
  }

  try {
    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress: {
        ...(shippingAddress || {}),
        phone: shippingAddress?.phone || customer?.phone || profilePhone,
      },
      appliedCoupon: String(appliedCoupon || '').trim().toUpperCase(),
      paymentStatus: 'Unpaid',
      amountPaid: 0,
      isPaid: false,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get logged-in user's orders
// @route GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all orders (admin only)
// @route GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get order by ID (admin only)
// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name image category brand');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update order status (admin only)
// @route PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Failed', 'Refund Requested'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const update = { status };

    // Delivered/Completed orders are considered fully paid.
    if (status === 'Delivered' || status === 'Completed') {
      const existingOrder = await Order.findById(req.params.id).select('totalAmount');
      if (!existingOrder) return res.status(404).json({ message: 'Order not found' });

      update.paymentStatus = 'Paid';
      update.amountPaid = Number(existingOrder.totalAmount) || 0;
      update.isPaid = true;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update order payment (admin only)
// @route PUT /api/orders/:id/payment
const updateOrderPayment = async (req, res) => {
  const { paymentStatus, amountPaid } = req.body;
  const validPaymentStatuses = ['Unpaid', 'Partial', 'Paid'];

  if (!validPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ message: 'Invalid payment status value' });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const totalAmount = Number(order.totalAmount) || 0;
    let normalizedPaidAmount = Number(amountPaid);

    if (!Number.isFinite(normalizedPaidAmount) || normalizedPaidAmount < 0) {
      return res.status(400).json({ message: 'Amount paid must be a valid positive number' });
    }

    if (paymentStatus === 'Unpaid') {
      normalizedPaidAmount = 0;
    }

    if (paymentStatus === 'Paid') {
      normalizedPaidAmount = totalAmount;
    }

    if (paymentStatus === 'Partial') {
      if (normalizedPaidAmount <= 0 || normalizedPaidAmount >= totalAmount) {
        return res.status(400).json({ message: 'For partial payment, amount paid must be greater than 0 and less than total amount' });
      }
    }

    if (normalizedPaidAmount > totalAmount) {
      return res.status(400).json({ message: 'Amount paid cannot exceed total amount' });
    }

    order.paymentStatus = paymentStatus;
    order.amountPaid = normalizedPaidAmount;
    order.isPaid = paymentStatus === 'Paid';
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete order (admin only)
// @route DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
};
