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
  name: {
    type: String,
  },
  type: {
    type: String,
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
}, { toJSON: { virtuals: true } })

poProductSchema.index({ poRef: 1, company: 1, sku: 1, }, { unique: true });

poProductSchema.virtual('boxscans', {
  ref: 'BoxScan', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'poProduct', // is equal to `foreignField`
  options: {} // Query options, see http://bit.ly/mongoose-query-options
});

const PoProduct = mongoose.model("PoProduct", poProductSchema);

module.exports = PoProduct;
