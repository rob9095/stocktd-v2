const mongoose = require('mongoose');

const poProductSchema = new mongoose.Schema({
  po: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
  },
  poRef: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  skuCompany: {
    type: String,
    require: true,
  },
  product: {
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

poProductSchema.index({ poRef: 1, company: 1, sku: 1, }, { unique: true });

const PoProduct = mongoose.model("PoProduct", poProductSchema);

module.exports = PoProduct;
