const express = require('express');
const router = express.Router();
const { verifySignUpToken, resetPassword, updateAccount, sendEmailVerification } = require('../handlers/account');

router.post('/verify', verifySignUpToken);
router.post('/email-verification', sendEmailVerification);
router.post('/reset-password', resetPassword);
router.post('/update', updateAccount);

module.exports = router;