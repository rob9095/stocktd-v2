const db = require('../models');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../services/sendEmail');

exports.signin = async function(req, res, next) {
	try {
		let user = await db.User.findOne({
			email: req.body.email
		});
		let { id, email, company } = user;
		let isMatch = await user.comparePassword(req.body.password);
		if(isMatch){
			let token = jwt.sign(
			{
				id,
				email,
				company
			},
				process.env.SECRET_KEY
			);
			return res.status(200).json({
				id,
				email,
				company,
				token
			});
		} else {
			return next({
				status: 400,
				message: 'Invalid email or password'
			})
		}
	} catch(err) {
		return next({
			status: 400,
			message: 'Invalid email or password'
		})
	}
};

exports.signup = async function(req, res, next) {
	try {
		// first check for empty values
		let reqValues = ['email', 'password', 'company']
		let values = Object.entries(req.body)
		let errors = [];
		for (let val of values) {
			if (val[1] === '' || val[1].length <= 0) {
				if (reqValues.includes(val[0])) {
					errors.push({
						input: val[0],
						value: val[1],
						message: `Please enter a valid ${val[0]}`
					})
				}
			}
		}
		if (errors.length > 0) {
			return next({
				status: 400,
				message: 'Please fill in the required inputs',
			})
		}
		// second check for password length, email is validated in user schema
		if (req.body.password.length < 6) {
			return next({
				status: 400,
				message: 'Password must be at least 6 characters',
			})
		}
		// check the email and company name are open
		let foundUser = await db.User.findOne({email: req.body.email})
		let foundCompany = await db.Company.findOne({name: req.body.company})
		if (foundUser) {
			return next({
				status: 400,
				message: 'Email already exists',
			})
		} else if (foundCompany) {
			return next({
				status: 400,
				message: 'Company already exists',
			})
		}
		// create the company
		let createdCompany = await db.Company.create({
			name: req.body.company,
		})
		// create the user
		let userInfo = {
			...req.body,
			emailVerified: false,
		}
		let user = await db.User.create(userInfo);
		createdCompany.users.push(user._id)
		user.companyId = createdCompany._id
		user.save();
		createdCompany.save();
		let { id, email, company } = user;
		let token = jwt.sign(
		{
			id,
			email,
			company
		},
		process.env.SECRET_KEY
		);
		// create the signup token
		let signUpToken = await db.SignUpToken.create({email: req.body.email})
		//send the verification email
		let emailRes = await sendEmail({
			from: 'noreply@stocktd.com',
			subject: 'Please confirm your email',
			to: req.body.email,
			html: `
				<div class="emailVerifyContainer">
					<h2>Welcome to stocktd</h2>
					<p>Please click the link below to confirm your email address</p>
					<a href="https://stocktd.com/verify-email/${signUpToken._id}"><button class="ui teal button">Confirm my email</button></a>
					<p>Have some questions? <a href="#">Contact Us</a></p>
				</div>
			`,
		})

		return res.status(200).json({
			id,
			email,
			company,
			token
		});
	} catch(err) {
		if(err.code === 11000) {
			console.log(err)
			err.message = 'Sorry, that email and/or company has been taken.'
		}
		return next({
			status:400,
			message: err.message
		});

	}
};
