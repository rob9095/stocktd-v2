const db = require('../models');

exports.processProductImport = async (req, res, next) => {
	try {
		// if(req.body.update) {
		// 	let updates = req.body.products.json.map(p => ({
		// 		updateOne: {
		// 			filter: { skuCompany: `${p.sku}-${req.body.company}`},
		// 			update: {...p, company: req.body.company, skuCompany: `${p.sku}-${req.body.company}`},
		// 			upsert: true,
		// 		}
		// 	}))
		// 	let updatedProducts = await db.Product.bulkWrite(updates)
		// 	let products = await db.Product.find({company: req.body.company})
		// 	return res.status(200).json(updatedProducts, products)
		// } else {
		// 	let inserts = req.body.products.json.map(p => ({
		// 		insertOne: {
		// 			document: {...p, company: req.body.company, skuCompany: `${p.sku}-${req.body.company}`},
		// 		}
		// 	}))
		// 	let addedProducts = await db.Product.bulkWrite(inserts)
		// 	let products = await db.Product.find({company: req.body.company})
		// 	return res.status(200).json(addedProducts, products)
		// }
		// find all company products
		let companyProducts = await db.Product.find({company: req.body.company})
		// loop over all products and create array of updates to bulk write
		let productUpdates = req.body.products.json.map(p => {
			// find the related product and update interval
			let foundProduct = companyProducts.find(product => product.sku === p.sku)
			if (foundProduct) {
				return {
					updateOne: {
						filter: { skuCompany: `${p.sku}-${req.body.company}`},
						update: { ...p },
					}
				}
			} else {
				// otherwise insert it with inital qty of 0
				return {
					insertOne: {
						document: {
							...p,
							company: req.body.company,
							skuCompany: `${p.sku}-${req.body.company}`,
							quantityToShip: 0,
						}
					}
				}
			}
		})
		let updatedProducts = await db.Product.bulkWrite(productUpdates)
		return res.status(200).json({updatedProducts})
	} catch(err) {
		if(err.code === 11000) {
			console.log(err)
			err.message = 'Duplicate SKUs found. Please update instead.'
		}
		return next(err);
	}
};

exports.getProducts = async (req, res, next) => {
	try {
		let query = {
			company: req.body.company,
		}
		for (let val of req.body.query){
			if ((Number.isInteger(parseInt(val[1])))) {
				console.log(val[2])
				query = val[2] === undefined ?
					{
						...query,
						[val[0]]: val[1],
					}
				 :
				 {
					 ...query,
					 [val[0]]: {[`$${val[2]}`]: val[1]},
				 }
			} else {
				query = {
					...query,
					[val[0]]: { $regex : new RegExp(val[1], "i") },
				}
			}
		}
		let count = await db.Product.count(query)
		const limit = req.body.rowsPerPage
		const skip = (req.body.activePage * req.body.rowsPerPage) - req.body.rowsPerPage
		const totalPages = Math.floor(count / req.body.rowsPerPage)
		let products = await db.Product.find(query).skip(skip).limit(limit).sort({[req.body.sortBy]: req.body.sortDirection})
		return res.status(200).json({
			products,
			totalPages,
			skip,
			activePage: req.body.activePage,
			rowsPerPage: req.body.rowsPerPage,
		})
	} catch(err) {
		return next(err);
	}
}

exports.updateProducts = async (req,res,next) => {
	try {
		let updates = req.body.updates.map(u=>{
			if (u.sku === undefined) {
				return {
					updateOne: {
						filter: { _id: u.id },
						update: { ...u },
						upsert: true,
					}
				}
			} else {
				return {
					updateOne: {
						filter: {_id: u.id},
						update: { ...u, skuCompany: `${u.sku}-${req.body.company}` },
						upsert: true,
					}
				}
			}
		})
		let updatedProducts = await db.Product.bulkWrite(updates)
		return res.status(200).json({updatedProducts})
	} catch(err) {
		return next(err)
	}
}

exports.removeProducts = async (req,res,next) => {
	try {
		let products = req.body.products.map(id=>({
			deleteOne: {
				filter: {_id: id}
			}
		}))
		let deletedProducts = await db.Product.bulkWrite(products)
		return res.status(200).json({deletedProducts})
	} catch(err) {
		return next(err)
	}
}
