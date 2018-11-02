const mongoose = require('mongoose');

const boxPrefixSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
})

const BoxPrefix = mongoose.model("BoxPrefix", boxPrefixSchema);

module.exports = BoxPrefix;
