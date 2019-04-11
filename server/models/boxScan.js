const mongoose = require('mongoose');

const boxScanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  skuCompany: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  poRef: {
    type: String,
    required: true,
  },
  barcode: {
    type: String,
  },
  locations: [{
    type: String,
  }],
  createdOn: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  scanToPo: {
    type: Boolean,
    required: true,
  }

});

const BoxScan = mongoose.model("BoxScan", boxScanSchema);

module.exports = BoxScan;
