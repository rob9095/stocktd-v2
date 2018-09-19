const express = require('express');
const router = express.Router();
const { processPurchaseOrderImport, getCompanyPurchaseOrders, getPoProducts, updatePurchaseOrder, getCompanyPoProducts } = require('../handlers/purchaseOrders');

router.post('/', getCompanyPurchaseOrders);
router.post('/import-csv', processPurchaseOrderImport);
router.post('/products', getPoProducts);
router.post('/update', updatePurchaseOrder);
router.post('/products-all', getCompanyPoProducts);

module.exports = router;
