const Order = require('../models/Order');
const Setting = require('../models/Setting');
const { createNotification } = require('../utils/notificationService');

// @desc  Create new order
// @route POST /api/orders
const createOrder = async (req, res) => {
  const { items, totalAmount, shippingAddress, customer, appliedCoupon, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }

  const profilePhone = String(req.user?.phone || '').trim();
  const customerName = String(customer?.name || '').trim();
  const customerPhone = String(customer?.phone || '').trim();
  const effectivePhone = String(shippingAddress?.phone || customerPhone || profilePhone).trim();

  if (!effectivePhone) {
    return res.status(400).json({ message: 'Phone number is required to place an order' });
  }

  if (!req.user && !customerName) {
    return res.status(400).json({ message: 'Customer name is required for guest checkout' });
  }

  const normalizedPaymentMethod = String(paymentMethod || 'cod').trim().toLowerCase();

  try {
    const settings = await Setting.findOne({}).select('paymentMethods');
    const configuredPaymentMethods = settings?.paymentMethods && typeof settings.paymentMethods === 'object'
      ? settings.paymentMethods
      : {
          cod: { enabled: true },
          bkash: { enabled: true },
          nogod: { enabled: true },
          card: { enabled: false },
        };

    const enabledPaymentMethodIds = Object.entries(configuredPaymentMethods)
      .filter(([, config]) => Boolean(config?.enabled))
      .map(([methodId]) => String(methodId || '').trim().toLowerCase())
      .filter(Boolean);

    if (!enabledPaymentMethodIds.includes(normalizedPaymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const order = await Order.create({
      user: req.user?._id || null,
      items,
      totalAmount,
      shippingAddress: {
        ...(shippingAddress || {}),
        phone: effectivePhone,
      },
      appliedCoupon: String(appliedCoupon || '').trim().toUpperCase(),
      paymentMethod: normalizedPaymentMethod,
      customer: {
        name: customerName || String(req.user?.name || '').trim(),
        phone: effectivePhone,
        email: String(customer?.email || req.user?.email || '').trim(),
        note: String(customer?.note || '').trim(),
        address: String(customer?.address || shippingAddress?.address || '').trim(),
      },
      paymentStatus: 'Unpaid',
      amountPaid: 0,
      isPaid: false,
    });

    await createNotification({
      type: 'order',
      title: 'New Order',
      message: `${customerName || req.user?.name || 'Guest customer'} placed a new order`,
      actorName: customerName || String(req.user?.name || '').trim(),
      actorEmail: String(customer?.email || req.user?.email || '').trim(),
      actorUserId: req.user?._id || null,
      orderId: order._id,
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

// @desc  Get order payment info (public for immediate payment step)
// @route GET /api/orders/:id/payment-info
const getOrderPaymentInfo = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select('_id totalAmount paymentMethod paymentTrxId paymentSenderNumber paymentSubmittedAt status createdAt');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Submit transaction id for mobile payment
// @route PUT /api/orders/:id/transaction
const submitOrderTransaction = async (req, res) => {
  const trxId = String(req.body?.trxId || '').trim();
  const senderNumber = String(req.body?.senderNumber || '').trim();
  if (!trxId) {
    return res.status(400).json({ message: 'Transaction ID is required' });
  }

  if (!senderNumber) {
    return res.status(400).json({ message: 'Sender number is required' });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderPaymentMethod = String(order.paymentMethod || '').toLowerCase();
    const settings = await Setting.findOne({}).select('paymentMethods');
    const methodConfig = settings?.paymentMethods?.[orderPaymentMethod] || null;
    const isMobilePaymentOrder =
      ['bkash', 'nogod'].includes(orderPaymentMethod) ||
      String(methodConfig?.type || '').toLowerCase() === 'mobile_banking';

    if (!isMobilePaymentOrder) {
      return res.status(400).json({ message: 'Transaction submission is only available for mobile payment orders' });
    }

    order.paymentTrxId = trxId;
    order.paymentSenderNumber = senderNumber;
    order.paymentSubmittedAt = new Date();
    order.paymentVerificationStatus = 'Pending';
    await order.save();

    return res.json({
      message: 'Transaction ID submitted successfully',
      orderId: order._id,
      paymentTrxId: order.paymentTrxId,
      paymentSenderNumber: order.paymentSenderNumber,
      paymentSubmittedAt: order.paymentSubmittedAt,
      paymentVerificationStatus: order.paymentVerificationStatus,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Update payment transaction verification status (admin only)
// @route PUT /api/orders/:id/transaction-status
const updateOrderTransactionStatus = async (req, res) => {
  const status = String(req.body?.status || '').trim();
  const validStatuses = ['Pending', 'Success'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid transaction status value' });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!String(order.paymentTrxId || '').trim() || !String(order.paymentSenderNumber || '').trim()) {
      return res.status(400).json({ message: 'Transaction information is missing for this order' });
    }

    order.paymentVerificationStatus = status;

    if (status === 'Success') {
      const totalAmount = Number(order.totalAmount) || 0;
      order.paymentStatus = 'Paid';
      order.amountPaid = totalAmount;
      order.isPaid = true;
    }

    await order.save();

    return res.json({
      message: 'Transaction status updated successfully',
      orderId: order._id,
      paymentVerificationStatus: order.paymentVerificationStatus,
      paymentStatus: order.paymentStatus,
      amountPaid: order.amountPaid,
      isPaid: order.isPaid,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  getOrderPaymentInfo,
  submitOrderTransaction,
  updateOrderTransactionStatus,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
};
