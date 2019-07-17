function errorHandler(error, request, response, next) {
	let message = error ? Array.isArray(error.message) ? error.message : [error.message || 'Opps something went wrong'] : ['Opps something went wrong']
	return response.status(error.status || 500).json({
		error: {
			//message: !Array.isArray(error.message) ? [error.message] || [error] : error.message || ['Opps something went wrong.'],
			message,
		}
	});
}
module.exports = errorHandler;
