const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
  },
  skuCompany: {
    type: String,
    required: true,
    unique: true,
  },
  barcode: {
    type: String,
  },
  barcodeCompany: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  quantityToShip: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
  },
  supplier: {
    type: String,
  },
  brand: {
    type: String,
  },
  weight: {
    type: Number,
  },
  weightType: {
    type: String,
  },
  company: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  asin: {
    type: String,
  },
  defaultLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  defaultBox: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoxScan'
  },
  createdOn: {
    type: Date,
    default: Date.now,
  }
},{ toJSON: { virtuals: true } })

productSchema.index({ company: 1, sku: 1, }, { unique: true });

productSchema.virtual('boxscans', {
  ref: 'BoxScan', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'product', // is equal to `foreignField`
  options: {} // Query options, see http://bit.ly/mongoose-query-options
});

const Product = mongoose.model("Product", productSchema);


module.exports = Product;
