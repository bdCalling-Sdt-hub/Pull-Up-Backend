const { addIntentPayment, addConnectIntentPayment, getAllTransactions, currentBalances, addConnectIntentPaymentEvent } = require('../services/paymentService');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');

require('dotenv').config();

const IntentPayment = catchAsync(async (req, res) => {
    console.log("Hello Gorom", req.body?.packageDuration)
    const result = await addIntentPayment(JSON.parse(req.body?.data), req.user.email, req.body?.packageDuration, req.body?.userAccountType);

    sendResponse(res, { statusCode: 201, data: result, message: 'Package Create Successfully', success: true });
});

const connectIntentPayment = catchAsync(async (req, res) => {
    const result = await addConnectIntentPayment(JSON.parse(req.body?.data), req.user.email, req.body?.productId);
    sendResponse(res, { statusCode: 201, data: result, message: 'Package Create Successfully', success: true });
});

const connectIntentPaymentEvent = catchAsync(async (req, res) => {
    const result = await addConnectIntentPaymentEvent(JSON.parse(req.body?.data), req.user.email, req.body?.eventId);
    sendResponse(res, { statusCode: 201, data: result, message: 'Package Create Successfully', success: true });
});

const getAllTransaction = catchAsync(async (req, res) => {
    const result = await getAllTransactions(req.query, req.user.email);
    sendResponse(res, { statusCode: 200, data: result, message: 'All Transactions Successfully', success: true });
});

const currentBalance = catchAsync(async (req, res) => {
    const result = await currentBalances(req.query, req.user.email, req.user.userId);
    sendResponse(res, { statusCode: 200, data: result, message: 'Transactions Successfully', success: true });
});

module.exports = {
    IntentPayment,
    connectIntentPayment,
    connectIntentPaymentEvent,
    getAllTransaction,
    currentBalance
}