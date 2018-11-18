const express = require('express');
const router = express.Router();
const { upsertBoxScan } = require('../handlers/boxScans');

router.post('/', upsertBoxScan);

module.exports = router;
