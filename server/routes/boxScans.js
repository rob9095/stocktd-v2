const express = require('express');
const router = express.Router();
const { upsertBoxScan, deleteBoxScans, handleBoxUpdates, importBoxScans } = require("../handlers/boxScans");

router.post('/', upsertBoxScan);
router.post('/delete', deleteBoxScans);
router.post('/update', handleBoxUpdates);
router.post('/import', importBoxScans);

module.exports = router;
