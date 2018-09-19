const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	company: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true
	},
	emailVerified: {
		type: Boolean,
		default: false,
	},
	profileImageUrl: {
		type: String
	},
	firstName: {
		type: String,
	},
	lastName: {
		type: String,
	},
	referredBy: {
		type: String,
	},
	companyId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Company'
	}
});

userSchema.path('email').validate(function (email) {
	let emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	return emailRegex.test(email);
}, 'Invalid Email')

userSchema.pre('save', async function(next) {
	try {
		if(!this.isModified('password')){
			return next();
		}
		let salt = bcrypt.genSaltSync(10);
		let hashedPassword = await bcrypt.hashSync(this.password, salt);
		this.password = hashedPassword;
		return next();
	  } catch (err) {
		  return next(err);
	  }
});

userSchema.methods.comparePassword = async function(candidatePassword, next) {
	try {
		let isMatch = await bcrypt.compare(candidatePassword, this.password);
		return isMatch;
	} catch(err){
		return next(err);
	}
};

const User = mongoose.model('User', userSchema);

module.exports = User;
