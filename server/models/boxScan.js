const mongoose = require('mongoose');

const boxScanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  scannedProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  scannedSKU: {
    type: String,
  },
  boxLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  },
  companyName: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now(),
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

const BoxScan = mongoose.model("BoxScan", boxScanSchema);

module.exports = BoxScan;
