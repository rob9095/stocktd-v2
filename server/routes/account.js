const express = require('express');
const router = express.Router();
const { verifySignUpToken, resetPassword, updateAccount, sendEmailVerification } = require('../handlers/account');

router.post('/verify/:token_id', verifySignUpToken);
router.post('/email-verification', sendEmailVerification);
router.post('/reset-password', resetPassword);
router.post('/update-account', updateAccount);

module.exports = router;