const mongoose = require('mongoose');
const User = require('../models/user');
const Order = require('../models/orders');
const Item = require('../models/item');

const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ServerError,
} = require('../errors/errors');

// Admin controllers
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    console.log(
      `Received request to update order ${orderId} to status ${status}`
    );
    const validStatuses = [
      'pending',
      'shipped',
      'delivered',
      'returned',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      return next(new BadRequestError('Invalid order status'));
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return next(new NotFoundError('Order not found'));
    }

    res.status(200).json(order);
  } catch (err) {
    console.error('Server error updating order status:', err.message);
    next(new ServerError('Server error while updating order status'));
  }
};

const removeOrder = async (req, res) => {
  try {
    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return next(new BadRequestError('Invalid order ID format'));
    }

    // Check if the user is an admin
    if (!req.user.isAdmin) {
      return next(new UnauthorizedError('Admin access required'));
    }

    // Find and delete the order
    const order = await Order.findByIdAndDelete(req.params.orderId);

    // Check if order exists
    if (!order) {
      return next(new NotFoundError('Order not found'));
    }

    res.json({ message: 'Order removed successfully', order });
  } catch (error) {
    next(new ServerError('An error occurred while removing the order'));
  }
};

// Normalize item
const normalizeItem = (item) => {
  return {
    _id: item._id,
    name: item.name || item.title,
    price: item.price || 0,
    description: item.description || 'No description available',
    imageUrl:
      item.image || item.imageUrl?.startsWith('http')
        ? item.imageUrl
        : `http://localhost:5000${item.imageUrl}`,
    isFeatured: item.isFeatured || false,
  };
};

// Create a new order
const createOrder = async (req, res, next) => {
  try {
    const { productId, quantity, address } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return next(new UnauthorizedError('User not authenticated.'));
    }

    if (!productId || !quantity || !address) {
      return next(new BadRequestError('Missing required fields.'));
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new BadRequestError('Invalid product ID format.'));
    }

    const item = await Item.findOne({ productId });

    if (!item) {
      console.log(' Item not found with productId:', productId);
      const all = await Item.find({});

      return next(new NotFoundError('Item not found.'));
    }

    const total = item.price * quantity;

    const order = new Order({
      user: userId,
      item,
      quantity,
      total,
      address,
      status: 'pending',
      imageUrl: item.imageUrl,
    });

    await order.save();

    res.status(201).json(order);
  } catch (err) {
    console.error(' Error creating order:', err.message);
    next(new ServerError('Error creating order'));
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return next(new NotFoundError('Order not found'));
    }

    // Check if the user owns this order
    if (order.user.toString() !== req.user.userId.toString()) {
      return next(new UnauthorizedError('You do not own this order'));
    }

    // Check if the order is in a cancellable status
    if (order.status !== 'pending') {
      return next(new BadRequestError('Order cannot be canceled'));
    }

    order.status = 'canceled';
    await order.save();
    res.json({ message: 'Order canceled successfully', order });
  } catch (error) {
    console.error('Error canceling order:', error);
    next(new ServerError('An error occurred while canceling the order'));
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).populate(
      'item',
      'name price imageUrl description isFeatured'
    );

    const normalizedOrders = orders.map((order) => ({
      ...order.toObject(),
      item: order.item.map((item) => normalizeItem(item)),
    }));

    res.status(200).json(normalizedOrders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    next(new ServerError('An error occurred while fetching user orders'));
  }
};
const getAllOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return next(new UnauthorizedError('Admin access required'));
    }

    const orders = await Order.find().populate(
      'item',
      'name price imageUrl description isFeatured'
    );
    const normalizedOrders = orders.map((order) => ({
      ...order.toObject(),
      item: normalizeItem(order.item),
    }));
    console.log(normalizedOrders);
    res.status(200).json(normalizedOrders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    next(new ServerError('An error occurred while fetching orders'));
  }
};

// Get orders by item
const getOrdersByItem = async (req, res, next) => {
  const { itemId } = req.params;

  try {
    const orders = await Order.find({ item: itemId }).populate(
      'user',
      'name email'
    );
    const normalizedOrders = orders.map((order) => ({
      ...order.toObject(),
      item: normalizeItem(order.item),
    }));

    if (normalizedOrders.length === 0) {
      return next(new NotFoundError('No orders found for this item'));
    }
    res.status(200).json(normalizedOrders);
  } catch (err) {
    console.error('Error fetching orders by item:', err.message);
    next(new ServerError('An error occurred while fetching orders by item'));
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrdersByItem,
  getAllOrders,
  removeOrder,
  cancelOrder,
  updateOrderStatus,
};
