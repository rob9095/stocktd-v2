const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  boxId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoxScan',
  },
  pullCount: {
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
  isDefault: {
    type: Boolean,
    default: false,
  }
})

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
