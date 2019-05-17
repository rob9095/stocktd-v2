const db = require('../models');


const buildQuery = (queryArr) => {
	try {
		if (!Array.isArray(queryArr) || queryArr.filter(val => !Array.isArray(val)).length > 0) {
			console.log(queryArr)
			throw 'Please provide query with array of arrays'
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
				// numbers, query array has thrid array element for numbers and we use it as $lte,$gte,$gt,$lt, or strict equal to
			} else if (val[2]) {
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
		return(query)
	} catch(err) {
		throw err.toString()
	}
}

const buildPopulateArray = (popArray,company) => {
	try {
		return popArray.map(popConfig=> {
			//create a match with the query if it exists otherwise just add the company
			let match = popConfig.query && buildQuery(popConfig.query) || {}
			match = {
				...match,
				company
			}
			//build the nested populate array if its an array otherwise leave it be
			let populate = Array.isArray(popConfig.populate) ? buildPopulateArray(popConfig.populate, company) : popConfig.populate
			return({
				...popConfig,
				match,
				populate
			})
		})
	} catch(err) {
		throw err.toString()
	}
}

/*
* QUERY pagnated model data
* Accepted Values: array of arrays in req.body.query, the document model in req.body.model,  sortDirection, sortBy, activePage, rowsPerPage in req.body
* Returns: Array of pagnated docs in data, pagnation information
*/
exports.queryModelData = async (req, res, next) => {
	try {
		// query is a object built from the incoming query array. incoming query array is an array of arrays and structure looks like [['searchKey','searchValue' || searchArr', '=,lte,gte,etc'],[],etc]
		let query = Array.isArray(req.body.query) && req.body.query.length > 0 && buildQuery(req.body.query) || {}
		query = {
			...query,
			company: req.body.company,
		}
		let populateArray = Array.isArray(req.body.populateArray) && req.body.populateArray.length > 0
			? buildPopulateArray(req.body.populateArray, req.body.company)
			: []
		console.log({populateArray})
		let count = await db[req.body.model].count(query)
		const limit = req.body.rowsPerPage
		const skip = (req.body.activePage * req.body.rowsPerPage) - req.body.rowsPerPage
    const totalPages = Math.floor(count / req.body.rowsPerPage)
		let data = await db[req.body.model].find(query).skip(skip).limit(limit).sort({[req.body.sortBy]: req.body.sortDirection}).populate(populateArray)
		for (let popConfig of populateArray) {
			//if we had to match in the populate config, remove any empty arrays or null values from data
			delete popConfig.match.company
			if (Object.keys(popConfig.match).length > 0) {
				console.log('removing null data for key '+ popConfig.path)
				data = data.filter(doc => doc[popConfig.path] !== null && doc[popConfig.path].length !== 0)
			}
			//check nested populates
			if (Array.isArray(popConfig.populate)) {
				for (let nestedPop of popConfig.populate) {
					delete nestedPop.match.company
					if (Object.keys(nestedPop.match).length > 0) {
						console.log('removing nested empty data for key ' + nestedPop.path)
						data = data.filter(doc => {
							if (Array.isArray(doc[popConfig.path]) && doc[popConfig.path].filter(nestedDoc=>nestedDoc[nestedPop.path] !== null && nestedDoc[nestedPop.path].length !== 0).length > 0){
								return doc
							}
						})
					}
				}
			}
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
				filter: {_id: id, company: req.body.company}
			}
		}))
		let deletedDocs = updates.length > 0 && await db[req.body.model].bulkWrite(updates)
		return res.status(200).json({deletedDocs})
	} catch(err) {
		return next(err)
	}
}


/*
* UPDATE Document Refs for a model
* used after upsert if neccesary
*/
updateModelDocumentsRefs = (config) => {
	let { updates, refUpdates, model, refModel, company } = config
	return new Promise(async (resolve,reject) => {
		try {
			//find all the recently updated docs
			let foundDocs = updates.length > 0 ? await db[model].find({ $and: [{ $or: updates.map(u => ({ ...u, company })) }] }) : []
			let docRefs = foundDocs.length > 0 ? foundDocs.map(d => d._id) : []
			//loop over the refUpdates and bulk update the refs
			let docRefUpdates = refUpdates.map(doc=>({
				updateOne: {
					filter: { [doc.filterRef]: doc[doc.filterRef], company },
					update: {
						...doc.refArray ? { [doc.ref]: docRefs } : foundDocs[0]._id || null,
					},
				}
			}))
			let updatedRefs = await db[refModel].bulkWrite(docRefUpdates)
			resolve(updatedRefs)
		} catch(err) {
			reject({message: err.toString()})
		}
	})
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
				filter: {[req.body.filterRef]: doc[req.body.filterRef], company: req.body.company},
				update: {
					company: req.body.company,
          ...doc,
					...req.body.model === 'Product' && doc.sku && {skuCompany: doc.sku+"-"+req.body.company},
					...req.body.model === 'Product' && doc.barcode && { barcodeCompany: doc.barcode + "-" + req.body.company }
        },
				upsert: true,
			}
		}))
		let upsertedDocs = updates.length > 0 && await db[req.body.model].bulkWrite(updates)
		let updatedRefs = {}
		if (Array.isArray(req.body.refUpdates) && req.body.refUpdates.length > 0) {
			updatedRefs = await updateModelDocumentsRefs({
				updates: req.body.data,
				refUpdates: req.body.refUpdates,
				refModel: req.body.refModel,
				model: req.body.model,
				company: req.body.company,
			})
		}
		return res.status(200).json({upsertedDocs, updatedRefs})
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
		let data = await db[req.body.model].find(query).limit(limit).populate(req.body.populateArray)
		return res.status(200).json({data})
	} catch(err) {
		return next(err)
	}
}