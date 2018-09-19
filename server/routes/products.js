const express = require('express');
const router = express.Router();
const { processProductImport, getProducts, updateProducts, removeProducts } = require('../handlers/products');

router.post('/import-csv', processProductImport);
router.post('', getProducts)
router.post('/update', updateProducts)
router.post('/delete', removeProducts)

module.exports = router;
