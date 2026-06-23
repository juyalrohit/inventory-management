const productService = require('../services/productService');
const { sendSuccess } = require('../utils/responseHandler');
const { validateProduct, validateProductUpdate } = require('../validators/productValidator');

async function createProduct(req, res, next) {
  try {
    const errors = validateProduct(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const product = await productService.createProduct(req.body, req.user?.id || null);
    return sendSuccess(res, product, 'Product created', 201);
  } catch (error) {
    return next(error);
  }
}

async function getProducts(req, res, next) {
  try {
    const products = await productService.listProducts({
      search: req.query.search,
      active: req.query.active !== undefined ? req.query.active === 'true' : undefined
    });
    return sendSuccess(res, products, 'Products loaded');
  } catch (error) {
    return next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    return sendSuccess(res, product, 'Product loaded');
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const errors = validateProductUpdate(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const product = await productService.updateProduct(req.params.id, req.body);
    return sendSuccess(res, product, 'Product updated');
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const result = await productService.removeProduct(req.params.id);
    return sendSuccess(res, result, 'Product deleted');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
};

