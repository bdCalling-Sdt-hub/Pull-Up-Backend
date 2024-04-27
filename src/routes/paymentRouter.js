const express = require('express');
const auth = require('../middlewares/auth');
const { IntentPayment, connectIntentPayment, getAllTransaction } = require('../controllers/paymentController');
const router = express.Router();

router.post('/create-payment-intent', auth('user'), IntentPayment);
router.post('/connect-create-payment-intent', auth('user'), connectIntentPayment);
router.get('/transactions', auth('admin', 'user'), getAllTransaction)

module.exports = router;