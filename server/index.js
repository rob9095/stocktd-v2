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
const modelRoutes = require('./routes/models');
const poProductRoutes = require('./routes/poProducts');
const boxScanRoutes = require('./routes/boxScans');
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

//purchase order routes
app.use('/api/models', modelRoutes);

//po products routes
app.use('/api/po-products', poProductRoutes);

//po products routes
app.use('/api/scans', boxScanRoutes);


app.use(errorHandler);

const server = app.listen(PORT, function(){
	console.log(`Server starting on port ${PORT}`)
});

server.timeout = 720000;
