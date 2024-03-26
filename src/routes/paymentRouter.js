const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/payment', IntentPayment);

module.exports = router;