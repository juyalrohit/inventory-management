const express = require('express');
const stockController = require('../controllers/stockController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/movements', protect, stockController.getMovements);
router.post('/adjust', protect, authorizeRoles('admin', 'manager', 'staff'), stockController.adjustStock);

module.exports = router;

