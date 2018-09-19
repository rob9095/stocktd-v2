const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  marketplace: {
    type: String,
    required: true,
  },
  marketplaceORderId: {
    type: String,
    required: true,
  },
  orderIntegrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Integration',
  },
  shipFirst: {
    type: String,
  },
  shipLast: {
    type: String,
  },
  shipPhone: {
    type: String,
  },
  shipEmail: {
    type: String,
  },
  shipStreetOne: {
    type: String,
  },
  shipStreetTwo: {
    type: String,
  },
  shipCompany: {
    type: String,
  },
  shipZip: {
    type: String,
  },
  shipState: {
    type: String,
  },
  shipCountry: {
    type: String,
  },
  shipRegion: {
    type: String,
  },
  orderProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  orderWeight: {
    type: Number,
  },
  orderWeightType: {
    type: String,
  },
  orderTotal: {
    type: Number,
  },
  orderTax: {
    type: Number,
  },
  orderShipping: {
    type: Number,
  },
  orderShippingType: {
    type: String,
  },
  isShipped: {
    type: Boolean,
    default: false,
  },
  trackingNumber: {
    type: String,
  },
  orderDate: {
    type: Date,
    default: Date.now(),
  },
  companyName: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  }
})

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
