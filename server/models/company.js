const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    default: "free",
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
  }],
  warehouseType: {
    type: String,
    default: "simple",
  }
})

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
