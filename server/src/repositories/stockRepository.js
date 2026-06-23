const { getPool } = require('../config/db');

async function recordMovement(connectionOrNull, movement) {
  const db = connectionOrNull || getPool();
  const sql = `
    INSERT INTO stock_movements
      (product_id, movement_type, quantity, reference_type, reference_id, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    movement.productId,
    movement.movementType,
    movement.quantity,
    movement.referenceType || null,
    movement.referenceId || null,
    movement.notes || null,
    movement.createdBy || null
  ];
  const [result] = await db.execute(sql, params);
  return result.insertId;
}

async function listMovements(connectionOrNull, filters = {}) {
  const db = connectionOrNull || getPool();
  const conditions = [];
  const params = [];

  if (filters.productId) {
    conditions.push('sm.product_id = ?');
    params.push(filters.productId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `
    SELECT sm.*, p.name AS product_name, p.sku
    FROM stock_movements sm
    JOIN products p ON p.id = sm.product_id
    ${whereClause}
    ORDER BY sm.created_at DESC
    `,
    params
  );
  return rows;
}

async function getStockSummary(connectionOrNull) {
  const db = connectionOrNull || getPool();
  const [rows] = await db.execute(`
    SELECT
      COALESCE(SUM(CASE WHEN movement_type = 'IN' THEN quantity ELSE 0 END), 0) AS total_in,
      COALESCE(SUM(CASE WHEN movement_type = 'OUT' THEN quantity ELSE 0 END), 0) AS total_out,
      COALESCE(SUM(CASE WHEN movement_type = 'ADJUSTMENT' THEN quantity ELSE 0 END), 0) AS total_adjustments
    FROM stock_movements
  `);
  return rows[0];
}

module.exports = {
  recordMovement,
  listMovements,
  getStockSummary
};

