const express = require('express');
const router = express.Router();
const { updatePoProducts, removePoProducts } = require('../handlers/poProducts');

router.post('/update', updatePoProducts);
router.post('/delete', removePoProducts);

module.exports = router;
