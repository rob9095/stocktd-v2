const express = require('express');
const router = express.Router();
const { updatePurchaseOrder, handlePOImport, removePurchaseOrder } = require('../handlers/purchaseOrders');

router.post('/import-csv', handlePOImport);
router.post('/update', updatePurchaseOrder);
router.post('/delete', removePurchaseOrder);

module.exports = router;
