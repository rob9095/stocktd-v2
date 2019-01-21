const mongoose = require('mongoose');

const boxPrefixSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  company: {
    type: String,
    required: true,
  }
})

const BoxPrefix = mongoose.model("BoxPrefix", boxPrefixSchema);

module.exports = BoxPrefix;
