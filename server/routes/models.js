const express = require('express');
const router = express.Router();
const { queryModelData, removeModelDocuments } = require('../handlers/models');

router.post('/query', queryModelData);
router.post('/delete', removeModelDocuments);

module.exports = router;
