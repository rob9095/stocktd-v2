function errorHandler(error, request, response, next) {
	return response.status(error.status || 500).json({
		error: {
			...typeof error === 'string' ? error : {...error},
			message: Array.isArray(error.message) ? error.message : [error.message] || ['Opps something went wrong.'],
		}
	});
}
module.exports = errorHandler;
