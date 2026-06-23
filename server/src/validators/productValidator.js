function validateProduct(body) {
  const errors = [];
  if (!body.sku || body.sku.trim().length < 2) errors.push('SKU is required');
  if (!body.name || body.name.trim().length < 2) errors.push('Product name is required');
  if (body.price === undefined || Number.isNaN(Number(body.price)) || Number(body.price) < 0) errors.push('Valid price is required');
  if (body.stockQuantity !== undefined && (Number.isNaN(Number(body.stockQuantity)) || Number(body.stockQuantity) < 0)) errors.push('Stock quantity must be a non-negative number');
  if (body.reorderLevel !== undefined && (Number.isNaN(Number(body.reorderLevel)) || Number(body.reorderLevel) < 0)) errors.push('Reorder level must be a non-negative number');
  return errors;
}

function validateProductUpdate(body) {
  const errors = [];
  if (body.price !== undefined && (Number.isNaN(Number(body.price)) || Number(body.price) < 0)) errors.push('Valid price is required');
  if (body.stockQuantity !== undefined && (Number.isNaN(Number(body.stockQuantity)) || Number(body.stockQuantity) < 0)) errors.push('Stock quantity must be a non-negative number');
  if (body.reorderLevel !== undefined && (Number.isNaN(Number(body.reorderLevel)) || Number(body.reorderLevel) < 0)) errors.push('Reorder level must be a non-negative number');
  return errors;
}

module.exports = {
  validateProduct,
  validateProductUpdate
};

