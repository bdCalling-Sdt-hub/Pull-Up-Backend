const express = require('express');
const auth = require('../middlewares/auth');
const { IntentPayment, connectIntentPayment } = require('../controllers/paymentController');
const router = express.Router();

router.post('/create-payment-intent', auth('user'), IntentPayment);
router.post('/connect-create-payment-intent', auth('user'), connectIntentPayment);

module.exports = router;