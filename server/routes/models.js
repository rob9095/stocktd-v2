const express = require('express');
const router = express.Router();
const { queryModelData, removeModelDocuments, upsertModelDocuments, getAllModelDocuments } = require('../handlers/models');

router.post('/query', queryModelData);
router.post('/delete', removeModelDocuments);
router.post('/upsert', upsertModelDocuments);
router.post('/get-all', getAllModelDocuments);

module.exports = router;
