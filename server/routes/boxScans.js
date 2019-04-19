const express = require('express');
const router = express.Router();
const { upsertBoxScan, deleteBoxScans, handleBoxUpdates } = require("../handlers/boxScans");

router.post('/', upsertBoxScan);
router.post('/delete', deleteBoxScans);
router.post('/update', handleBoxUpdates);

module.exports = router;
