const express = require('express');
const router = express.Router();
const { upsertBoxScan, deleteBoxScans } = require("../handlers/boxScans");

router.post('/', upsertBoxScan);
router.post('/delete', deleteBoxScans);

module.exports = router;
