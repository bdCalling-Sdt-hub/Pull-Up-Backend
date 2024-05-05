require('dotenv').config();
const response = require("../helpers/response");
const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/sendResponse');
const catchAsync = require('../utils/catchAsync');
const { addEvent, getAllEvents, getSingleEvent, userWiseEvents, getEventHistory, getReceiverEventHistory, eventJoin } = require('../services/eventService');


// create a user
const createEvent = catchAsync(async (req, res) => {
    const result = await addEvent(req.body, req.user.email, req.file);
    sendResponse(res, { statusCode: 201, data: result, message: 'Event Create Successfully', success: true });
});

const allEvent = catchAsync(async (req, res) => {
    const result = await getAllEvents(req.query)
    sendResponse(res, { statusCode: 200, data: result, message: 'Event Retrieve successfully', success: true })
});

const userWiseEvent = catchAsync(async (req, res) => {
    req.query.userId = req.user.userId
    const result = await userWiseEvents(req.query);
    sendResponse(res, { statusCode: 200, data: result, message: 'User Wise Event Retrieve successfully', success: true })
});

const envetHistory = catchAsync(async (req, res) => {
    const result = await getEventHistory(req.user.userId)
    sendResponse(res, { statusCode: 200, data: result, message: 'User Retrieve successfully', success: true })
})

const receiverEventHistory = catchAsync(async (req, res) => {
    const result = await getReceiverEventHistory(req.user.userId)
    sendResponse(res, { statusCode: 200, data: result, message: 'User Retrieve successfully', success: true })
})

const getEventJoin = catchAsync(async (req, res) => {
    const result = await eventJoin()
    sendResponse(res, { statusCode: 200, data: result, message: 'Event Join Retrieve successfully', success: true })
})

const singleEvent = catchAsync(async (req, res) => {
    const result = await getSingleEvent(req.params.id)
    sendResponse(res, { statusCode: 200, data: result, message: 'Event Retrieve successfully', success: true })
})


module.exports = {
    createEvent,
    allEvent,
    userWiseEvent,
    envetHistory,
    receiverEventHistory,
    getEventJoin,
    singleEvent
}