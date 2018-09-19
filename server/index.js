require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const errorHandler = require('./handlers/error');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const productRoutes = require('./routes/products');
const poRoutes = require('./routes/purchaseOrders');
const db = require("./models");
const { loginRequired, ensureCorrectUser } = require('./middleware/auth');
const PORT = 8080;

app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));

// all routes here

// auth routes
app.use('/api/auth', authRoutes);

// account routes
app.use('/api/account', accountRoutes);

//product routes
app.use('/api/products', productRoutes);

//purchase order routes
app.use('/api/purchase-orders', poRoutes);

app.use(errorHandler);

app.listen(PORT, function(){
	console.log(`Server starting on port ${PORT}`)
});
