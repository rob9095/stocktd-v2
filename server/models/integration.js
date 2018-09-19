const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  thirdPartyName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
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
  apiKey: {
    type: String,
  },
})

const Integration = mongoose.model("Integration", integrationSchema);

module.exports = Integration;
