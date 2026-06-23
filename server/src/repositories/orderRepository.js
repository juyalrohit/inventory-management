const { getPool } = require('../config/db');

async function createOrder(connectionOrNull, order) {
  const db = connectionOrNull || getPool();
  const sql = `
    INSERT INTO orders (order_number, customer_name, customer_email, status, total_amount, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    order.orderNumber,
    order.customerName,
    order.customerEmail || null,
    order.status || 'pending',
    order.totalAmount || 0,
    order.createdBy || null
  ];
  const [result] = await db.execute(sql, params);
  return result.insertId;
}

async function createOrderItem(connectionOrNull, item) {
  const db = connectionOrNull || getPool();
  const sql = `
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await db.execute(sql, [
    item.orderId,
    item.productId,
    item.quantity,
    item.unitPrice,
    item.lineTotal
  ]);
  return result.insertId;
}

async function listOrders(connectionOrNull, filters = {}) {
  const db = connectionOrNull || getPool();
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('o.status = ?');
    params.push(filters.status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `
    SELECT o.*, u.name AS created_by_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.created_by
    ${whereClause}
    ORDER BY o.created_at DESC
    `,
    params
  );
  return rows;
}

async function findOrderById(connectionOrNull, id) {
  const db = connectionOrNull || getPool();
  const [orderRows] = await db.execute(
    `
    SELECT o.*, u.name AS created_by_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.created_by
    WHERE o.id = ?
    `,
    [id]
  );

  if (!orderRows[0]) {
    return null;
  }

  const [itemRows] = await db.execute(
    `
    SELECT oi.*, p.name AS product_name, p.sku
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
    `,
    [id]
  );

  return {
    ...orderRows[0],
    items: itemRows
  };
}

async function updateOrderStatus(connectionOrNull, id, status) {
  const db = connectionOrNull || getPool();
  const [result] = await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  return result.affectedRows;
}

async function updateOrderTotal(connectionOrNull, id, totalAmount) {
  const db = connectionOrNull || getPool();
  const [result] = await db.execute('UPDATE orders SET total_amount = ? WHERE id = ?', [totalAmount, id]);
  return result.affectedRows;
}

async function getOrderMetrics(connectionOrNull) {
  const db = connectionOrNull || getPool();
  const [rows] = await db.execute(`
    SELECT
      COUNT(*) AS total_orders,
      COALESCE(SUM(total_amount), 0) AS total_revenue,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_orders
    FROM orders
  `);
  return rows[0];
}

async function getRecentOrders(connectionOrNull, limit = 5) {
  const db = connectionOrNull || getPool();
  const [rows] = await db.execute(
    `
    SELECT id, order_number, customer_name, status, total_amount, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT ?
    `,
    [limit]
  );
  return rows;
}

module.exports = {
  createOrder,
  createOrderItem,
  listOrders,
  findOrderById,
  updateOrderStatus,
  updateOrderTotal,
  getOrderMetrics,
  getRecentOrders
};

