const { AppError } = require('../middleware/errorMiddleware');
const { getConnection } = require('../config/db');
const productRepository = require('../repositories/productRepository');
const stockRepository = require('../repositories/stockRepository');

async function adjustStock(payload, actorId = null) {
  const product = await productRepository.findById(null, payload.productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const movementType = payload.movementType || 'ADJUSTMENT';
  const quantity = Number(payload.quantity);
  if (!quantity || quantity <= 0) {
    throw new AppError('Quantity must be greater than zero', 400);
  }

  const delta = movementType === 'OUT' ? -Math.abs(quantity) : Math.abs(quantity);
  const nextStock = Number(product.stock_quantity) + delta;
  if (nextStock < 0) {
    throw new AppError('Insufficient stock for this adjustment', 400);
  }

  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    await productRepository.setStock(connection, product.id, nextStock);
    const movementId = await stockRepository.recordMovement(connection, {
      productId: product.id,
      movementType,
      quantity: Math.abs(quantity),
      referenceType: payload.referenceType || 'MANUAL',
      referenceId: payload.referenceId || null,
      notes: payload.notes || null,
      createdBy: actorId
    });
    await connection.commit();
    return { movementId, productId: product.id, stockQuantity: nextStock };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listMovements(filters = {}) {
  return stockRepository.listMovements(null, filters);
}

module.exports = {
  adjustStock,
  listMovements
};

