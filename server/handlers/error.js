function errorHandler(error, request, response, next) {
	return response.status(error.status || 500).json({
		error: {
			message: !Array.isArray(error.message) ? [error.message] || [error] : error.message || ['Opps something went wrong.'],
		}
	});
}
module.exports = errorHandler;
