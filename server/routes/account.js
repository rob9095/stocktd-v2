const express = require('express');
const router = express.Router();
const { verifySignUpToken, resendVerificationEmail, resetPassword } = require('../handlers/account');

router.post('/verify/:token_id', verifySignUpToken);
router.post('/resend-emailver', resendVerificationEmail);
router.post('/reset-password', resetPassword);

module.exports = router;
