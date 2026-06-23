const orderService = require('../services/orderService');
const { sendSuccess } = require('../utils/responseHandler');

async function getSummary(req, res, next) {
  try {
    const summary = await orderService.getDashboardMetrics();
    return sendSuccess(res, summary, 'Dashboard summary loaded');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSummary
};

