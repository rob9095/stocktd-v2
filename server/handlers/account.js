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
    let token = await db.SignUpToken.findOne({_id: req.params.token_id})
    if (token) {
      // update user and remove token
      let user = await db.User.findOne({email: token.email})
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
		let token = await db.SignUpToken.findOne({email: req.body.email})
		if (token) {
			let emailRes = await sendEmail({
						from: 'noreply@stocktd.com',
						subject: 'Please confirm your email',
						to: req.body.email,
						html: `
							<div class="emailVerifyContainer">
								<h2>Welcome to stocktd</h2>
								<p>Please click the link below to confirm your email address</p>
								<a href="https://stocktd.com/verify-email/${token._id}"><button class="ui teal button">Confirm my email</button></a>
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
