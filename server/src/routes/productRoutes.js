const express = require('express');
const productController = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, productController.getProducts);
router.get('/:id', protect, productController.getProduct);
router.post('/', protect, authorizeRoles('admin', 'manager'), productController.createProduct);
router.put('/:id', protect, authorizeRoles('admin', 'manager'), productController.updateProduct);
router.delete('/:id', protect, authorizeRoles('admin'), productController.deleteProduct);

module.exports = router;

