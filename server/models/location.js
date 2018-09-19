const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  boxes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoxScan',
  }],
  pullCount: {
    type: Number,
    default: 0,
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
  isDefault: {
    type: Boolean,
    default: false,
  }
})

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
