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
  boxScans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box',
  }],
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
  }
})

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
