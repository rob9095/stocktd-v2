const mongoose = require('mongoose');

const barcodeSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
})

barcodeSchema.index({ barcode: 1, sku: 1, company: 1 }, { unique: true });

const Barcode = mongoose.model("Barcode", barcodeSchema);

module.exports = Barcode;
