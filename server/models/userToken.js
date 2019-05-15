const mongoose = require('mongoose');

const UserTokenSchema = new mongoose.Schema({
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		tokenType: {
			type: String,
			required: true,
		},
    createdOn: {
      type: Date,
			default: Date.now(),
    },
	},
	{
		timestamps: true
	});

const UserToken = mongoose.model('UserToken', UserTokenSchema);
module.exports = UserToken;
