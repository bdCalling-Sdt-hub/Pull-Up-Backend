require('dotenv').config();
const response = require("../helpers/response");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const sendResponse = require('../utils/sendResponse');
const catchAsync = require('../utils/catchAsync');
const { addPackage, addPackagePrice } = require('../services/packageService');


// create a user
const createPackage = catchAsync(async (req, res) => {
    const result = await addPackage(req.body, req.user.email);

    sendResponse(res, { statusCode: 201, data: result, message: 'Package Create Successfully', success: true });
});

// create a user
const createPackagePrice = catchAsync(async (req, res) => {
    const result = await addPackagePrice(req.params.id, req.body);

    sendResponse(res, { statusCode: 201, data: result, message: 'Package Price Create Successfully', success: true });
});

module.exports = { createPackage, createPackagePrice }