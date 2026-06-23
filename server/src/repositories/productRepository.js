const { getPool } = require('../config/db');

async function createProduct(connectionOrNull, product) {
  const db = connectionOrNull || getPool();
  const sql = `
    INSERT INTO products (sku, name, description, category, price, stock_quantity, reorder_level, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    product.sku,
    product.name,
    product.description || null,
    product.category || null,
    product.price,
    product.stockQuantity || 0,
    product.reorderLevel || 0,
    product.isActive === undefined ? 1 : product.isActive ? 1 : 0
  ];
  const [result] = await db.execute(sql, params);
  return result.insertId;
}

async function findById(connectionOrNull, id) {
  const db = connectionOrNull || getPool();
  const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findBySku(connectionOrNull, sku) {
  const db = connectionOrNull || getPool();
  const [rows] = await db.execute('SELECT * FROM products WHERE sku = ?', [sku]);
  return rows[0] || null;
}

async function listProducts(connectionOrNull, filters = {}) {
  const db = connectionOrNull || getPool();
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(name LIKE ? OR sku LIKE ? OR category LIKE ?)');
    const searchValue = `%${filters.search}%`;
    params.push(searchValue, searchValue, searchValue);
  }

  if (filters.active !== undefined) {
    conditions.push('is_active = ?');
    params.push(filters.active ? 1 : 0);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.execute(`SELECT * FROM products ${whereClause} ORDER BY created_at DESC`, params);
  return rows;
}

async function updateProduct(connectionOrNull, id, product) {
  const db = connectionOrNull || getPool();
  const fields = [];
  const params = [];

  if (product.sku !== undefined) {
    fields.push('sku = ?');
    params.push(product.sku);
  }
  if (product.name !== undefined) {
    fields.push('name = ?');
    params.push(product.name);
  }
  if (product.description !== undefined) {
    fields.push('description = ?');
    params.push(product.description);
  }
  if (product.category !== undefined) {
    fields.push('category = ?');
    params.push(product.category);
  }
  if (product.price !== undefined) {
    fields.push('price = ?');
    params.push(product.price);
  }
  if (product.stockQuantity !== undefined) {
    fields.push('stock_quantity = ?');
    params.push(product.stockQuantity);
  }
  if (product.reorderLevel !== undefined) {
    fields.push('reorder_level = ?');
    params.push(product.reorderLevel);
  }
  if (product.isActive !== undefined) {
    fields.push('is_active = ?');
    params.push(product.isActive ? 1 : 0);
  }

  if (!fields.length) {
    return 0;
  }

  params.push(id);
  const [result] = await db.execute(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
  return result.affectedRows;
}

async function deleteProduct(connectionOrNull, id) {
  const db = connectionOrNull || getPool();
  const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows;
}

async function updateStock(connectionOrNull, id, quantityDelta) {
  const db = connectionOrNull || getPool();
  const [result] = await db.execute(
    'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
    [quantityDelta, id]
  );
  return result.affectedRows;
}

async function setStock(connectionOrNull, id, stockQuantity) {
  const db = connectionOrNull || getPool();
  const [result] = await db.execute('UPDATE products SET stock_quantity = ? WHERE id = ?', [stockQuantity, id]);
  return result.affectedRows;
}

async function getProductMetrics(connectionOrNull) {
  const db = connectionOrNull || getPool();
  const [rows] = await db.execute(`
    SELECT
      COUNT(*) AS total_products,
      SUM(CASE WHEN stock_quantity <= reorder_level THEN 1 ELSE 0 END) AS low_stock_products,
      COALESCE(SUM(stock_quantity), 0) AS total_units,
      COALESCE(SUM(stock_quantity * price), 0) AS inventory_value
    FROM products
  `);
  return rows[0];
}

module.exports = {
  createProduct,
  findById,
  findBySku,
  listProducts,
  updateProduct,
  deleteProduct,
  updateStock,
  setStock,
  getProductMetrics
};

