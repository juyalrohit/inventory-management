function validateOrder(body) {
  const errors = [];
  if (!body.customerName || body.customerName.trim().length < 2) errors.push('Customer name is required');
  if (!Array.isArray(body.items) || body.items.length === 0) errors.push('At least one order item is required');

  if (Array.isArray(body.items)) {
    body.items.forEach((item, index) => {
      if (!item.productId) errors.push(`Item ${index + 1}: productId is required`);
      if (!item.quantity || Number.isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
        errors.push(`Item ${index + 1}: quantity must be greater than zero`);
      }
    });
  }

  return errors;
}

function validateOrderStatus(body) {
  const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const errors = [];
  if (!body.status || !allowed.includes(body.status)) errors.push('Valid status is required');
  return errors;
}

module.exports = {
  validateOrder,
  validateOrderStatus
};

