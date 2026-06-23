const { AppError } = require('../middleware/errorMiddleware');
const { getConnection } = require('../config/db');
const productRepository = require('../repositories/productRepository');
const stockRepository = require('../repositories/stockRepository');

async function createProduct(payload, actorId = null) {
  const existing = await productRepository.findBySku(null, payload.sku);
  if (existing) {
    throw new AppError('SKU already exists', 409);
  }

  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const productId = await productRepository.createProduct(connection, payload);

    if ((payload.stockQuantity || 0) !== 0) {
      await stockRepository.recordMovement(connection, {
        productId,
        movementType: 'IN',
        quantity: Number(payload.stockQuantity || 0),
        referenceType: 'PRODUCT_CREATE',
        notes: 'Initial stock',
        createdBy: actorId
      });
    }

    await connection.commit();
    return await productRepository.findById(connection, productId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listProducts(filters = {}) {
  return productRepository.listProducts(null, filters);
}

async function getProductById(id) {
  const product = await productRepository.findById(null, id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
}

async function updateProduct(id, payload) {
  const current = await productRepository.findById(null, id);
  if (!current) {
    throw new AppError('Product not found', 404);
  }

  await productRepository.updateProduct(null, id, payload);
  return productRepository.findById(null, id);
}

async function removeProduct(id) {
  const current = await productRepository.findById(null, id);
  if (!current) {
    throw new AppError('Product not found', 404);
  }

  await productRepository.deleteProduct(null, id);
  return { deleted: true };
}

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  removeProduct
};

