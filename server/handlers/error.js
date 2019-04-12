function errorHandler(error, request, response, next) {
	return response.status(error.status || 500).json({
		error: {
			errorOptions: error.errorOptions,
			message: [error.message] || ['Opps something went wrong.'],
		}
	});
}
module.exports = errorHandler;
