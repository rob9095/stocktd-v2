const db = require('../models');
const { createImportStatus } = require('../handlers/importStatus');
const upsertBarcode = require('./barcode')
const { validateSchema } = require('../middleware/validator');

exports.processProductImport = async (req, res, next) => {
	try {
		let company = req.body.company;
		let updates = req.body.data.map(p => {
			let _id = p.id
			delete p.id
			if(p.action === 'delete') {
				return {
					deleteOne: {
						filter: _id ? { _id } : { skuCompany: `${p.sku}-${company}`},
					}
				}
			} else {
				return {
					updateOne: {
						filter: _id ? {_id} : { skuCompany: `${p.sku}-${company}`},
						update: {
							...p,
							...p.barcode && { barcodeCompany: p.barcode + "-" + company },
							...p.sku && { skuCompany: p.sku + "-" + company },
							company
						},
						upsert: true,
						collation: { locale: 'en', strength: 2 },
						$setOnInsert: {createdOn: new Date(), quantityToShip: 0, ...p.sku && {skuCompany: p.sku +"-"+company, barcodeCompany: p.barcode || p.sku + "-" + company}},
					}
				}
			}
		})
		let importResult = await db.Product.bulkWrite(updates)
		return res.status(200).json({status: 'success', importResult})
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
			let barcode = err.errmsg.includes('barcodeCompany_1 dup key')
			let sku = err.errmsg.includes('skuCompany_1 dup key')
			let message = barcode ? 'Duplicate barcode found' : sku ? 'Duplicate sku found' : 'Duplicate barcode or sku found'
			return next({
				status: 404,
				//message: ['Duplicate SKUs or barcodes found.'],
				message,
			})
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
		if (!Array.isArray(req.body.updates) || req.body.updates.filter(u=>u.id).length === 0) {
			return next({
				status: 404,
				message: ['Please provide update array with id']
			})
		}
		let updates = req.body.updates.map(u=>({
			updateOne: {
				filter: { _id: u.id },
				update: {
					...u,
					...u.sku && { skuCompany: `${u.sku}-${req.body.company}` },
					...u.barcode && { barcodeCompany: `${u.barcode}-${req.body.company}` },
				},
			}
		}))
		let updatedProducts = await db.Product.bulkWrite(updates)
		return res.status(200).json({updatedProducts})
	} catch(err) {
		if (err.code === 11000) {
			return next({
				status: 404,
				message: ['Duplicate SKUs or barcodes found.']
			})
		}
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
		return next(err);
	}
}
