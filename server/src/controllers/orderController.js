const orderService = require('../services/orderService');
const { sendSuccess } = require('../utils/responseHandler');
const { validateOrder, validateOrderStatus } = require('../validators/orderValidator');

async function createOrder(req, res, next) {
  try {
    const errors = validateOrder(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const order = await orderService.createOrder(req.body, req.user?.id || null);
    return sendSuccess(res, order, 'Order created', 201);
  } catch (error) {
    return next(error);
  }
}

async function getOrders(req, res, next) {
  try {
    const orders = await orderService.listOrders({
      status: req.query.status
    });
    return sendSuccess(res, orders, 'Orders loaded');
  } catch (error) {
    return next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id);
    return sendSuccess(res, order, 'Order loaded');
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const errors = validateOrderStatus(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    return sendSuccess(res, order, 'Order status updated');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateStatus
};

