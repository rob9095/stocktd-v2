const db = require('../models');
const { createImportStatus } = require('../handlers/importStatus');

exports.processProductImport = async (req, res, next) => {
	try {
		if (req.body.products.length > 7000) {
			return next({
				status: 404,
				message: ['Request to large']
			})
		}
		let updates = req.body.products.map(p => {
			if(p.action === 'delete') {
				return {
					deleteOne: {
						filter: { skuCompany: `${p.sku}-${req.body.company}`},
					}
				}
			} else {
				return {
					updateOne: {
						filter: { skuCompany: `${p.sku}-${req.body.company}`},
						update: {
							...p,
							barcodeCompany: p.barcode ? p.barcode : p.sku  + "-" + req.body.company,
							skuCompany: `${p.sku}-${req.body.company}`,
							company: req.body.company
						},
						upsert: true,
						$setOnInsert: { createdOn: new Date(), quantityToShip: 0, },
					}
				}
			}
		})
		await db.Product.bulkWrite(updates)
		return res.status(200).json({status: 'success'})
		//let importStatus = await createImportStatus('Product',req.body.company,updates)
		// let updateProducts = [];
		// if (updates.length > 7000)  {
		// 	await db.Product.bulkWrite(updates)
		// } else {
		// 	await db.Product.bulkWrite(updates)
		// }
		// let newProducts = await db.Product.find({quantityToShip: undefined})
		// let newProductUpdates = newProducts.map(p=>({
		// 	updateOne: {
		// 		filter: { skuCompany: p.skuCompany},
		// 		update: {quantityToShip: 0}
		// 	}
		// }))
		// if (newProductUpdates.length > 7000) {
		// 	let totalBatches = newProductUpdates.length / 7000
		// 	let batches = [];
		// 	for (let x = 0; x<=totalBatches;x++) {
		// 		batches.push([...newProductUpdates.splice(x,x+7000)])
		// 	}
		// 	for (batch of batches) {
		// 		db.Product.bulkWrite(batch)
		// 	}
		// } else {
		// 	await db.Product.bulkWrite(newProductUpdates)
		// }
		// find all company products
		// let companyProducts = await db.Product.find({company: req.body.company})
		// // loop over all products and create array of updates to bulk write
		// let productUpdates = req.body.products.map(p => {
		// 	// find the related product and update interval
		// 	let foundProduct = companyProducts.find(product => product.sku === p.sku)
		// 	if (foundProduct && req.body.update) {
		// 		return {
		// 			updateOne: {
		// 				filter: { skuCompany: `${p.sku}-${req.body.company}`},
		// 				update: { ...p },
		// 			}
		// 		}
		// 	} else {
		// 		// otherwise insert it with inital qty of 0
		// 		return {
		// 			insertOne: {
		// 				document: {
		// 					...p,
		// 					company: req.body.company,
		// 					skuCompany: `${p.sku}-${req.body.company}`,
		// 					quantityToShip: 0,
		// 				}
		// 			}
		// 		}
		// 	}
		// })
		// let updatedProducts = await db.Product.bulkWrite(productUpdates)
		// return res.status(200).json({updatedProducts})
	} catch(err) {
		if(err.code === 11000) {
			console.log(err)
			err.message = 'Duplicate SKUs or Barcodes found. Please update instead.'
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
					}
				}
			} else {
				return {
					updateOne: {
						filter: {_id: u.id},
						update: { ...u, skuCompany: `${u.sku}-${req.body.company}` },
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
