const express = require('express');
const router = express.Router();
const { verifySignUpToken, resendVerificationEmail, resetPassword, updateAccount } = require('../handlers/account');

router.post('/verify/:token_id', verifySignUpToken);
router.post('/resend-emailver', resendVerificationEmail);
router.post('/reset-password', resetPassword);
router.post('/update-account', updateAccount);

module.exports = router;
