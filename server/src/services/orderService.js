const { AppError } = require('../middleware/errorMiddleware');
const { getConnection } = require('../config/db');
const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');
const stockRepository = require('../repositories/stockRepository');

function buildOrderNumber() {
  return `ORD-${Date.now()}`;
}

async function createOrder(payload, actorId = null) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    let totalAmount = 0;
    const normalizedItems = [];

    for (const item of payload.items) {
      const product = await productRepository.findById(connection, item.productId);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }

      const quantity = Number(item.quantity);
      if (product.stock_quantity < quantity) {
        throw new AppError(`Insufficient stock for product ${product.name}`, 400);
      }

      const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : Number(product.price);
      const lineTotal = unitPrice * quantity;
      totalAmount += lineTotal;

      normalizedItems.push({
        product,
        quantity,
        unitPrice,
        lineTotal
      });
    }

    const orderId = await orderRepository.createOrder(connection, {
      orderNumber: buildOrderNumber(),
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      status: payload.status || 'pending',
      totalAmount,
      createdBy: actorId
    });

    for (const item of normalizedItems) {
      await orderRepository.createOrderItem(connection, {
        orderId,
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal
      });

      await productRepository.setStock(connection, item.product.id, item.product.stock_quantity - item.quantity);
      await stockRepository.recordMovement(connection, {
        productId: item.product.id,
        movementType: 'OUT',
        quantity: item.quantity,
        referenceType: 'ORDER',
        referenceId: orderId,
        notes: `Order ${payload.customerName}`,
        createdBy: actorId
      });
    }

    await connection.commit();
    return orderRepository.findOrderById(connection, orderId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listOrders(filters = {}) {
  return orderRepository.listOrders(null, filters);
}

async function getOrderById(id) {
  const order = await orderRepository.findOrderById(null, id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  return order;
}

async function updateOrderStatus(id, status) {
  const order = await orderRepository.findOrderById(null, id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  await orderRepository.updateOrderStatus(null, id, status);
  return orderRepository.findOrderById(null, id);
}

async function getDashboardMetrics() {
  const [productMetrics, orderMetrics, stockSummary, recentOrders] = await Promise.all([
    productRepository.getProductMetrics(null),
    orderRepository.getOrderMetrics(null),
    stockRepository.getStockSummary(null),
    orderRepository.getRecentOrders(null, 5)
  ]);

  return {
    products: productMetrics,
    orders: orderMetrics,
    stock: stockSummary,
    recentOrders
  };
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  getDashboardMetrics
};

