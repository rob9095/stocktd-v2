const db = require('../models');
const jwt = require('jsonwebtoken');
const { sendUserEmailVerification } = require('./account');
require('dotenv').load();

const createUserToken = (signature) => {
	return new Promise((resolve,reject)=>{
		try {
			let token = jwt.sign({
				...signature,
			},
				process.env.SECRET_KEY
			);
			resolve(token)
		} catch(err) {
			reject(err)
		}
	})
}

const refreshUserToken = (authorization, user, create) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (create) {
				let nt = await createUserToken(user)
				resolve(nt)
			}
			const auth = authorization || ''
			let token = auth.split(' ')[1];
			jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
				if (decoded && decoded.id === user.id) {
					let nt = await createUserToken(user)
					resolve(nt)
				} else {
					reject({
						status: 401,
						message: 'Unauthorized'
					});
				}
			});
		} catch (err) {
			reject({
				status: 401,
				message: 'Unauthorized'
			});
		}
	})
}

exports.signin = async function(req, res, next) {
	try {
		let user = await db.User.findOne({
			email: { $regex: `^${req.body.email}$`, '$options': 'i' }
		});
		if (!user) {
			return next({
				status: 400,
				message: 'Invalid email or password'
			})			
		}
		let signature = (({ id, email, company, emailVerified }) => ({ id, email, company, emailVerified }))(user)
		if (req.body.silentAuth === true) {
			let auth = req.headers.authorization
			let token = await refreshUserToken(auth, signature)
			return res.status(200).json({
				...signature,
				token
			})
		}
		let isMatch = await user.comparePassword(req.body.password);
		if(isMatch){
			let token = createUserToken(signature)
			return res.status(200).json({
				...signature,
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
			message: 'Login Failed',
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
		let foundUser = await db.User.findOne({ email: { $regex: `^${req.body.email}$`, '$options': 'i' }})
		let foundCompany = await db.Company.findOne({ name: { $regex: `^${req.body.company}$`, '$options': 'i' }})
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
		//create default box prefix for user
		await db.BoxPrefix.create({
			name: req.body.email.split('@')[0],
			company: req.body.company,
			user: user._id,
		})
		let { id, email, company, emailVerified } = user;
		let token = jwt.sign(
		{
			id,
			email,
			company,
			emailVerified,
		},
		process.env.SECRET_KEY
		);

		//send email verification
		await sendUserEmailVerification({id: user._id})

		// legacy code for sending email verification
		// create the signup token
		// let signUpToken = await db.UserToken.create({tokenType: 'verify-email', user: user._id})
		//send the verification email
		// let emailRes = await sendEmail({
		// 	from: 'noreply@stocktd.com',
		// 	subject: 'Please confirm your email',
		// 	to: req.body.email,
		// 	html: `
		// 		<div class="emailContainer">
		// 			<h2>Welcome to stocktd</h2>
		// 			<p>Please click the link below to confirm your email address</p>
		// 			<a href="https://stocktd.com/verify-email/${signUpToken._id}"><button class="btn">Confirm my email</button></a>
		// 			<p>Have some questions? <a href="#">Contact Us</a></p>
		// 		</div>
		// 	`,
		// })

		return res.status(200).json({
			id,
			email,
			company,
			emailVerified,
			token
		});
	} catch(err) {
		if(err.code === 11000) {
			console.log(err)
			err.message = 'Sorry, that email and/or company has been taken.'
		}
		return next({
			status:400,
			message: 'Signup Failed',
		});

	}
};
