const db = require('../models');


const buildQuery = (queryArr) => {
	return new Promise((resolve,reject) => {
		if (!Array.isArray(queryArr) || queryArr.map(val=>!Array.isArray(val)).length > 0) {
			console.log(queryArr)
			reject('Please provide query with array of arrays')
		}
		let removeKeys = []
		let query = {}
		for (let val of queryArr) {
			// if the query already contains that key, lets create an $and query, only works for exact matches for now, no regex
			if (query[val[0]]) {
				let andQuery = queryArr.filter(v => v[0] === val[0]).map(v => ({ [v[0]]: v[1] }))
				query = {
					...query,
					$and: [{ $or: andQuery }],
				}
				// remove this key at the end of the query building loop
				removeKeys.push(val[0])
			} else if (Array.isArray(val[1])) {
				// array of dates
				let startDate = val[1][0]
				let endDate = val[1][1]
				query = {
					...query,
					[val[0]]: { $gte: startDate, $lt: endDate }
				}
				// numbers, if we get a third array item use it as $lte,$gte,$gt,$lt, otherwise use non Regex check
			} else if (val[2] !== undefined) {
				query = val[2] === "=" ?
					{
						...query,
						[val[0]]: val[1],
					}
					:
					{
						...query,
						[val[0]]: { [`$${val[2]}`]: val[1] },
					}
				//regex text feilds
			} else {
				query = {
					...query,
					[val[0]]: { $regex: new RegExp(val[1], "i") },
				}
			}
		}
		for (let key of removeKeys) {
			delete query[key]
		}
		resolve(query)
	})
}

/*
* QUERY pagnated model data
* Accepted Values: array of arrays in req.body.query, the document model in req.body.model,  sortDirection, sortBy, activePage, rowsPerPage in req.body
* Returns: Array of pagnated docs in data, pagnation information
*/
exports.queryModelData = async (req, res, next) => {
	try {
		// query is a object built from the incoming query array. incoming query array is an array of arrays and structure looks like [['searchKey','searchValue' || searchArr', '=,lte,gte,etc'],[],etc]
		let query = await buildQuery(req.body.query)
		query = {
			...query,
			company: req.body.company,
		}
		let populateArray = []
		if (Array.isArray(req.body.populateArray) && req.body.populateArray.length > 0) {
			for (let popConfig of req.body.populateArray) {
				let match = popConfig.query && await buildQuery(popConfig.query) || {}
				match = {
					...match,
					company: req.body.company,
				}
				populateArray.push({
					...popConfig,
					match,
				})
			}
			// populateArray = req.body.populateArray.map(async pC=>{
			// 	let query = pC.query && await buildQuery(pC.query) || {}
			// 	return ({
			// 		...pC,
			// 		...pC.query && { match: {...query, company: req.body.company} },
			// 	})
			// })
		}
		console.log(populateArray)
		let count = await db[req.body.model].count(query)
		const limit = req.body.rowsPerPage
		const skip = (req.body.activePage * req.body.rowsPerPage) - req.body.rowsPerPage
    const totalPages = Math.floor(count / req.body.rowsPerPage)
		let data = await db[req.body.model].find(query).skip(skip).limit(limit).sort({[req.body.sortBy]: req.body.sortDirection}).populate(populateArray)
		for (let popConfig of populateArray) {
			data = data.filter(doc=>doc[popConfig.path] !== null)
		}
		return res.status(200).json({
			data,
			totalPages,
			skip,
			activePage: req.body.activePage,
			rowsPerPage: req.body.rowsPerPage,
		})
	} catch(err) {
		return next(err);
	}
}

/*
*	DELETE model documents
*	Accepted Values: array of model IDs in req.body.data, document model name in req.body.model
*	Returns: array of deleted documents
*/
exports.removeModelDocuments = async (req,res,next) => {
	try {
		let updates = req.body.data.map(id=>({
			deleteOne: {
				filter: {_id: id}
			}
		}))
		let deletedDocs = await db[req.body.model].bulkWrite(updates)
		return res.status(200).json({deletedDocs})
	} catch(err) {
		return next(err)
	}
}

/*
*	UPSERT model documents
*	Accepted Values: array of model objects in req.body.data, document model name in req.body.model
*	Returns: array of upserted documents
*/
exports.upsertModelDocuments = async (req,res,next) => {
	try {
		let updates = req.body.data.map(doc=>({
			updateOne: {
				filter: {[req.body.filterRef]: doc[req.body.filterRef]},
				update: {
          ...doc,
					company: req.body.company,
					...req.body.model === 'Product' && doc.sku && {skuCompany: doc.sku+"-"+req.body.company},
					...req.body.model === 'Product' && doc.barcode && { barcodeCompany: doc.barcode + "-" + req.body.company }
        },
				upsert: true,
			}
		}))
		let upsertedDocs = await db[req.body.model].bulkWrite(updates)
		return res.status(200).json({upsertedDocs})
	} catch(err) {
		return next(err)
	}
}

/*
*	GET model documents matching documentRef
*	Accepted Values: object of document refs to search by, document model name in req.body.model
*	Returns: array of matching documents
*/
exports.getAllModelDocuments = async (req,res,next) => {
	try {
		if (req.body.limit > 100) {
			return next({
				status: 404,
				message: ['Request to large']
			})
		}
		let limit = req.body.limit || 10
		//remove empty strings from documentRef to allow for searchAll type query
		for (let ref of Object.entries(req.body.documentRef)) {
			if (!ref[1]) {
				delete req.body.documentRef[ref[0]]
			}
		}
		let query = {...req.body.documentRef, company: req.body.company}
		if (req.body.regex === true) {
			query = {}
			for (let val of Object.entries(req.body.documentRef)) {
				query = {
					...query,
					[val[0]]: { $regex : new RegExp(val[1], "i") },
				}
			}
		}
		let data = await db[req.body.model].find(query).limit(limit)
		return res.status(200).json({data})
	} catch(err) {
		return next(err)
	}
}