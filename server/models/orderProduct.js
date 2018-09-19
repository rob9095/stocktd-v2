const mongoose = require('mongoose');

const OrderProductSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  marketplaceOrderId: {
    type: String,
  },
  marketplace: {
    type: String,
  },
  orderProductSku: {
    type: String,
  },
  orderProductTitle: {
    type: String,
  },
  orderProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  orderProductQuantity: {
    type: Number,
  },
  orderProductWeight: {
    type: Number,
  },
  orderProductWeightType: {
    type: String,
  },
  companyName: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  }
})

const OrderProduct = mongoose.model("OrderProduct", OrderProductSchema);

module.exports = OrderProduct;
