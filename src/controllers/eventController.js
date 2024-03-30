require('dotenv').config();
const response = require("../helpers/response");
const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/sendResponse');
const catchAsync = require('../utils/catchAsync');
const { addEvent, getAllEvents, getSingleEvent } = require('../services/eventService');


// create a user
const createEvent = catchAsync(async (req, res) => {
    const result = await addEvent(req.body, req.user.email, req.file);
    sendResponse(res, { statusCode: 201, data: result, message: 'Event Create Successfully', success: true });
});

const allEvent = catchAsync(async (req, res) => {
    const result = await getAllEvents(req.query)
    sendResponse(res, { statusCode: 200, data: result, message: 'Event Retrieve successfully', success: true })
});

const singleEvent = catchAsync(async (req, res) => {
    const result = await getSingleEvent(req.params.id)
    sendResponse(res, { statusCode: 200, data: result, message: 'Event Retrieve successfully', success: true })
})


module.exports = { createEvent, allEvent, singleEvent }