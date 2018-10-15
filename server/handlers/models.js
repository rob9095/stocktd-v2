const db = require('../models');

// returns the type of value: either array, number, or string
const getType = (value) => {
	if ((Number.isInteger(parseInt(value)))) {
		return 'number';
	} else if (Array.isArray(value)) {
		return 'array'
	} else {
		return 'string'
	}
}

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
