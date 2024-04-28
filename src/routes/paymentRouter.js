const express = require('express');
const auth = require('../middlewares/auth');
const { IntentPayment, connectIntentPayment, getAllTransaction, currentBalance } = require('../controllers/paymentController');
const router = express.Router();

router.post('/create-payment-intent', auth('user'), IntentPayment);
router.post('/connect-create-payment-intent', auth('user'), connectIntentPayment);
router.get('/transactions', auth('admin', 'user'), getAllTransaction)
router.get('/current-balance', auth('user'), currentBalance)

module.exports = router;