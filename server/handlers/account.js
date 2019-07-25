const db = require('../models');
const { emailStyles, sendEmail } = require('../services/sendEmail');

exports.getAccountDetails = async function(req, res, next) {
	try {
		let foundUser = await db.User.findOne({_id: req.body.user.id})
		if (!foundUser) {
			return next({
				status: 400,
				message: 'User not found',
			})
		}
		let user = { firstName, lastName, email, profileImgUrl, company, emailVerified, } = foundUser
		return res.status(200).json({
			user
		})
	} catch(err) {
		return next(err)
	}
}

exports.verifySignUpToken = async function(req, res, next) {
	try {
    if (!req.body.token_id.match(/^[0-9a-fA-F]{24}$/)) {
      return next({
        status: 400,
				message: 'Invalid token'
      })
    }
    let token = await db.UserToken.findOne({_id: req.body.token_id})
    if (token) {
      // update user and remove token
      let user = await db.User.findOne({_id: token.user})
      if (user) {
        user.emailVerified = true;
        await user.save();
        await token.remove();
        return res.status(200).json({
          message: `Email Verified`
        });
      }
    } else {
      return next({
        status: 400,
        message: 'Invalid token',
      })
    }
	} catch(err) {
		return next(err);
	}
};

const sendUserEmailVerification = (user) => {
	return new Promise( async (resolve,reject) => {
		try {
			let { id } = user || {}
			let foundUser = await db.User.findOne({_id: id})
			if (!foundUser) {
				reject({
					message: 'Email failed'
				})
			}
			let token = await upsertUserToken({userId: id, tokenType: 'verify-email', update: true})
			await sendEmail({
				from: 'noreply@stocktd.com',
				subject: 'Please confirm your email',
				to: foundUser.email,
				html: `
							<div class="emailContainer">
								<h2>Welcome to stocktd</h2>
								<p>Please click the link below to confirm your email address</p>
								<a href="https://stocktd.com/verify-email/${token._id}"><button class="btn">Confirm my email</button></a>
								<p>Have some questions? <a href="#">Contact Us</a></p>
							</div>
						`,
			})
			resolve({
				status: 'Email sent succesfully',
			})
		} catch(err) {
			reject(err)
		}
	})
}

exports.sendEmailVerification = async (req, res, next) => {
	try {
		let result = await sendUserEmailVerification({id: req.body.user.id})
		return res.status(200).json({
			...result,
		})
	} catch(err) {
		return next(err)
	}
}

const upsertUserToken = (config) => {
	return new Promise(async (resolve,reject) => {
		try {
			const { userId, tokenType, update } = config
			if(!tokenType || !userId) {
				reject({
					message: ['Please provide a tokenType and id'],
				})
			}
			let user = await db.User.findById(userId)
			if (!user) {
				reject({
					message: ['Unable to create token'],
				})
			}
			let foundToken = await db.UserToken.findOne({user: user._id, tokenType})
			if (!foundToken) {
				//create it
				let token = await db.UserToken.create({user: user._id, tokenType})
				resolve(token)
			}
			if (update) {
				foundToken.createdOn = new Date()
				foundToken.save()
				resolve(foundToken)
			}
			resolve(foundToken)
		} catch(err) {
			reject(err)
		}
	})
}

const sendResetPasswordEmail = (email) => {
	return new Promise(async(resolve,reject) => {
		try {
			if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) === false) {
				reject({
					status: 400,
					message: ['Invalid Email']
				})
			}
			let user = await db.User.findOne({ email: { $regex: `^${email}$`, '$options': 'i' } })
			if (!user) {
				//silently resolve
				resolve({
					message: ['Email sent successfully']
				})
			}
			let token = await upsertUserToken({userId: user._id, tokenType: 'reset-pw', update: true,})
			//send the reset email if we have a token
			if (token._id) {
				let emailRes = await sendEmail({
					from: 'noreply@stocktd.com',
					subject: 'Reset Password',
					to: email,
					html: `
					<div class="emailContainer">
						<h2>Need a new password?</h2>
						<p>To get a new password for your stocktd account, just click the button below.</p>
						<a href="https://stocktd.com/reset-password/${token._id}"><button class="btn">Reset Password</button></a>
						<p>If you didn’t ask to reset your password, you can ignore this email. Your current password will still work.</p>
						<p>Have some questions? <a href="#">Contact Us</a></p>
					</div>
				`,
				})
			}
			resolve({
				message: ['Email sent successfully']
			})
		} catch(err) {
			reject(err)
		}
	})
}

//allow for update of email, password(currentPassword needed), firstName, lastName
const updateUserAccount = (config) => {
	return new Promise(async (resolve,reject) => {
		try {
			let { user, update } = config
			let { email, password, firstName, lastName, currentPassword } = update || {}
			let { _id } = user || {}
			let foundUser = await db.User.findById(_id)
			if (!foundUser) {
				reject({ message: 'Unable to update user' })
			}
			if (email) {
				//check if email is available
				let emailCheck = await db.User.findOne({ email: { $regex: `^${email}$`, '$options': 'i' } }) || {}
				emailCheck._id && reject({
					message: 'Email Already Exists',
				})
			}
			if (password) {
				//check if current password is a match 
				let isMatch = await foundUser.comparePassword(currentPassword)
				!isMatch && reject({ message: 'Incorrect current password'})
			}
			let userUpdate = {
				...email && { email, emailVerified: false },
				...password && { password },
				...firstName && { firstName },
				...lastName && { lastName },
			}

			//reject if update is empty
			!Object.keys(userUpdate) && reject({message: 'No update found'})

			user = await db.User.update({_id},userUpdate)
			//send new verification email if neccesary
			email && await sendUserEmailVerification({id: _id})
			resolve({
				user,
			})
		} catch(err) {
			reject(err)
		}
	})
}

exports.resetPassword = async (req, res, next) => {
	try {
		let result = req.body.token ? await updateUserAccount({user: req.body.token.user,update: req.body.update}) : await sendResetPasswordEmail(req.body.email)
		if (req.body.token) {
			//delete the token
			await db.UserToken.deleteOne({_id: req.body.token._id})
		}
		return res.status(200).json({
			...result,
		})
	} catch(err) {
		//return next(err)
		console.log(err)
		return res.status(400).json({message:err})
	}
}

exports.updateAccount = async (req, res, next) => {
	try {
		let {id = '' } = req.body.user
		let { update = {}} = req.body
		let result = await updateUserAccount({user: {_id: id}, update})
		return res.status(200).json({
			...result,
		})
	} catch(err) {
		return next(err)
	}
}


exports.sendUserEmailVerification = sendUserEmailVerification