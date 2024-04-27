const { addIntentPayment, addConnectIntentPayment, getAllTransactions } = require('../services/paymentService');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');

require('dotenv').config();

const IntentPayment = catchAsync(async (req, res) => {
    const result = await addIntentPayment(JSON.parse(req.body?.data), req.user.email);

    sendResponse(res, { statusCode: 201, data: result, message: 'Package Create Successfully', success: true });
});

const connectIntentPayment = catchAsync(async (req, res) => {
    const result = await addConnectIntentPayment(req.body, req.user.email);

    sendResponse(res, { statusCode: 201, data: result, message: 'Package Create Successfully', success: true });
});

const getAllTransaction = catchAsync(async (req, res) => {
    const result = await getAllTransactions(req.query, req.user.email);
    sendResponse(res, { statusCode: 200, data: result, message: 'All Transactions Successfully', success: true });
});

module.exports = {
    IntentPayment,
    connectIntentPayment,
    getAllTransaction
}