const mongoose = require('mongoose');

const PoProductSchema = new mongoose.Schema({
  poId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
  },
  poName: {
    type: String,
  },
  poType: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
  },
  companySku: {
    type: String,
    require: true,
  },
  poProductId: {
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
    default: Date.now(),
  },
  lastScan: {
    type: Date,
    default: Date.now(),
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

const PoProduct = mongoose.model("PoProduct", PoProductSchema);

module.exports = PoProduct;
