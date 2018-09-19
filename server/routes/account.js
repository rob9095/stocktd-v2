const express = require('express');
const router = express.Router();
const { verifySignUpToken, resendVerificationEmail } = require('../handlers/account');

router.post('/verify/:token_id', verifySignUpToken);
router.post('/resend-emailver', resendVerificationEmail);

module.exports = router;
