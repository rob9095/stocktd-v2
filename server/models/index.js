const mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost/stocktd', {
	keepAlive: true,
});

module.exports.User = require('./user');
module.exports.UserToken = require('./userToken');
module.exports.Company = require('./company');
module.exports.Integration = require('./integration');
module.exports.BoxScan = require('./boxScan');
module.exports.Product = require('./product');
module.exports.Location = require('./location');
module.exports.Barcode = require('./barcode');
module.exports.PoProduct = require('./poProduct');
module.exports.PurchaseOrder = require('./purchaseOrder');
module.exports.Order = require('./order');
module.exports.OrderProduct = require('./orderProduct');
module.exports.ImportStatus = require('./importStatus');
module.exports.BoxPrefix = require('./boxPrefix');