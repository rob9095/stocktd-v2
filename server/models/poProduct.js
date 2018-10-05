const mongoose = require('mongoose');

const PoProductSchema = new mongoose.Schema({
  poId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
  },
  poRef: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'complete',
  },
  sku: {
    type: String,
    required: true,
  },
  skuCompany: {
    type: String,
    require: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
  },
  scannedQuantity: {
    type: Number,
    default: 0,
  },
  company: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  lastScan: {
    type: Date,
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

const PoProduct = mongoose.model("PoProduct", PoProductSchema);

module.exports = PoProduct;
