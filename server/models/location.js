const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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

locationSchema.index({ name: 1, company: 1, }, { unique: true });

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
