const db = require('../models');

exports.queryModelData = async (req, res, next) => {
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
