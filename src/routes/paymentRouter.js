const express = require('express');
const auth = require('../middlewares/auth');
const { IntentPayment } = require('../controllers/paymentController');
const router = express.Router();

router.post('/create-payment-intent', auth('user'), IntentPayment);

module.exports = router;