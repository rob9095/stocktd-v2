const mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost/stocktd', {
	keepAlive: true
});

module.exports.User = require('./user');
module.exports.SignUpToken = require('./signUpToken');
module.exports.Company = require('./company');
module.exports.Integration = require('./integration');
module.exports.BoxScan = require('./boxScan');
module.exports.Product = require('./product');
module.exports.Location = require('./location');
module.exports.PoProduct = require('./poProduct');
module.exports.PurchaseOrder = require('./purchaseOrder');
module.exports.Order = require('./order');
module.exports.OrderProduct = require('./orderProduct');
