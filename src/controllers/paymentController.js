const { addIntentPayment, addConnectIntentPayment } = require('../services/paymentService');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');

require('dotenv').config();

const IntentPayment = catchAsync(async (req, res) => {
    const result = await addIntentPayment(req.body, req.user.email);

    sendResponse(res, { statusCode: 201, data: result, message: 'Package Create Successfully', success: true });
});

const connectIntentPayment = catchAsync(async (req, res) => {
    const result = await addConnectIntentPayment(req.body, req.user.email);

    sendResponse(res, { statusCode: 201, data: result, message: 'Package Create Successfully', success: true });
});

module.exports = { IntentPayment, connectIntentPayment }