const db = require('../models');

/*
* QUERY pagnated model data
* Accepted Values: array of arrays in req.body.query, the document model in req.body.model,  sortDirection, sortBy, activePage, rowsPerPage in req.body
* Returns: Array of pagnated docs in data, pagnation information
*/
exports.queryModelData = async (req, res, next) => {
	try {
		// query is a object built from the incoming query array. incoming query array structure looks like [['searchKey','searchValue || searchArr'],[],etc]
		let query = {
			company: req.body.company,
		}
		let removeKeys = []
		for (let val of req.body.query){
			// if the query already contains that key, lets create an $and query, only works for exact matches for now, no regex
			if (query[val[0]]) {
				let andQuery = req.body.query.filter(v => v[0] === val[0]).map(v=>({[v[0]]:v[1]}))
				query = {
					...query,
					$and: [{$or: andQuery}],
				}
				// remove this key at the end of the query building loop
				removeKeys.push(val[0])
			} else if (Array.isArray(val[1])){
				// array of dates
				let startDate = val[1][0]
				let endDate = val[1][1]
				query = {
					...query,
					[val[0]]: { $gte: startDate, $lt: endDate }
				}
				// numbers, if we get a third array item use it as $lte,$gte,$gt,$lt, otherwise use non Regex check
			} else if ((Number.isInteger(parseInt(val[1])))) {
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
				 //regex text feilds
			} else {
				query = {
					...query,
					[val[0]]: { $regex : new RegExp(val[1], "i") },
				}
			}
		}
		for (let key of removeKeys) {
			delete query[key]
		}
		let count = await db[req.body.model].count(query)
		const limit = req.body.rowsPerPage
		const skip = (req.body.activePage * req.body.rowsPerPage) - req.body.rowsPerPage
		const totalPages = Math.floor(count / req.body.rowsPerPage)
		let data = await db[req.body.model].find(query).skip(skip).limit(limit).sort({[req.body.sortBy]: req.body.sortDirection})
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
		let limit = req.body.limit ? req.body.limit > 100 ? 100 : 100 : 100
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