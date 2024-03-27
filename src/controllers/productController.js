require('dotenv').config();
const response = require("../helpers/response");
const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/sendResponse');
const catchAsync = require('../utils/catchAsync');
const { addProduct, getAllProducts, getSingleProduct } = require('../services/productService');


// create a user
const createProduct = catchAsync(async (req, res) => {
    const result = await addProduct(req.body, req.user.email, req.file);
    sendResponse(res, { statusCode: 201, data: result, message: 'Product Create Successfully', success: true });
});

const allProduct = catchAsync(async (req, res) => {
    const result = await getAllProducts(req.query)
    sendResponse(res, { statusCode: 200, data: result, message: 'Product Retrieve successfully', success: true })
});

const singleProduct = catchAsync(async (req, res) => {
    const result = await getSingleProduct(req.params.id)
    sendResponse(res, { statusCode: 200, data: result, message: 'User Retrieve successfully', success: true })
})


module.exports = { createProduct, allProduct, singleProduct }