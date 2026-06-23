const stockService = require('../services/stockService');
const { sendSuccess } = require('../utils/responseHandler');

async function adjustStock(req, res, next) {
  try {
    if (!req.body.productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    const result = await stockService.adjustStock(req.body, req.user?.id || null);
    return sendSuccess(res, result, 'Stock adjusted', 201);
  } catch (error) {
    return next(error);
  }
}

async function getMovements(req, res, next) {
  try {
    const movements = await stockService.listMovements({
      productId: req.query.productId
    });
    return sendSuccess(res, movements, 'Stock movements loaded');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  adjustStock,
  getMovements
};

