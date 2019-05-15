const db = require('../models');
const { emailStyles, sendEmail } = require('../services/sendEmail');

exports.verifySignUpToken = async function(req, res, next) {
	try {
    if (!req.params.token_id.match(/^[0-9a-fA-F]{24}$/)) {
      return next({
        status: 400,
        message: 'Unable to verify user'
      })
    }
    let token = await db.UserToken.findOne({_id: req.params.token_id})
    if (token) {
      // update user and remove token
      let user = await db.User.findOne({_id: token.user})
      if (user) {
        user.emailVerified = true;
        await user.save();
        await token.remove();
        return res.status(200).json({
          message: `Thanks for verifying your email`
        });
      }
    } else {
      return next({
        status: 400,
        message: 'Unable to verify user'
      })
    }
	} catch(err) {
		return next(err);
	}
};

exports.resendVerificationEmail = async (req, res, next) => {
	try {
		let token = await upsertUserToken({userId: req.body.user.id, tokenType: 'verify-email'})
		if (token._id) {
			let emailRes = await sendEmail({
						from: 'noreply@stocktd.com',
						subject: 'Please confirm your email',
						to: req.body.email,
						html: `
							<div class="emailContainer">
								<h2>Welcome to stocktd</h2>
								<p>Please click the link below to confirm your email address</p>
								<a href="https://stocktd.com/verify-email/${token._id}"><button class="btn">Confirm my email</button></a>
								<p>Have some questions? <a href="#">Contact Us</a></p>
							</div>
						`,
					})
				return res.status(200).json({status: 'Email sent succesfully'})
		} else {
			return next({
				status: 400,
				message: 'Unable to resend email'
			})
		}
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
			let user = await db.User.findOne({ email })
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

exports.resetPassword = async (req, res, next) => {
	try {
		let result = await sendResetPasswordEmail(req.body.email)
		return res.status(200).json({
			...result,
		})
	} catch(err) {
		return next(err)
	}
}
