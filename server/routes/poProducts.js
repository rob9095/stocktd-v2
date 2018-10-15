const express = require('express');
const router = express.Router();
const { updatePoProducts } = require('../handlers/poProducts');

router.post('/update', updatePoProducts);

module.exports = router;
