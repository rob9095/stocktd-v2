var jsonpack = require('jsonpack/main');

exports.unPack = function(req, res, next) {
	try {
    if (req.body) {
      console.log(req.body)
      req.body = jsonpack.unpack(req.body.packedJSON);
    }
    return next();
	} catch(err) {
		return next({
			status: 401,
			message: 'JSON error',
      err,
		});
	}
};
