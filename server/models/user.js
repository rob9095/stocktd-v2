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
	return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email);
}, 'Invalid Email')

userSchema.path('password').validate(function (pw) {
	return pw.length > 6;
}, 'Password must contain at least 6 characters')

userSchema.pre('update', async function (next) {
	try {
		let update = this.getUpdate()
		if (!update.password) {
			return next();
		}
		if (update.password.length < 6) {
			throw 'Password must contain at least 6 characters'
		}
		let salt = bcrypt.genSaltSync(10);
		let hashedPassword = await bcrypt.hashSync(update.password, salt);
		this.update({},{...update, password: hashedPassword})
		return next();
	} catch (err) {
		return next(err);
	}
});

userSchema.pre('save', async function(next) {
	try {
		if(!this.isModified('password')){
			return next();
		}
		if (this.password && this.password.length < 6) {
			throw 'Password must contain at least 6 characters'
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
		let isMatch = await bcrypt.compareSync(candidatePassword, this.password);
		return isMatch;
	} catch(err){
		return next(err);
	}
};

const User = mongoose.model('User', userSchema);

module.exports = User;
