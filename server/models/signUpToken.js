const mongoose = require('mongoose');

const SignUpTokenSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
		},
    createdTime: {
      type: Date,
      default: Date.now(),
    },
	},
	{
		timestamps: true
	}
);

const SignUpToken = mongoose.model('SignUpToken', SignUpTokenSchema);
module.exports = SignUpToken;
