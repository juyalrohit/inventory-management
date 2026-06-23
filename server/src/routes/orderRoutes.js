const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, orderController.getOrders);
router.get('/:id', protect, orderController.getOrder);
router.post('/', protect, authorizeRoles('admin', 'manager', 'staff'), orderController.createOrder);
router.patch('/:id/status', protect, authorizeRoles('admin', 'manager'), orderController.updateStatus);

module.exports = router;

