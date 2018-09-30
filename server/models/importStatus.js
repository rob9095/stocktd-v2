const mongoose = require('mongoose');

const importStatusSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
  },
  status: {
    type: String,
  },
  time: {
    type: String,
  }
})

const ImportStatus = mongoose.model("ImportStatus", importStatusSchema);

module.exports = ImportStatus;
