require('dotenv').config();
const response = require("../helpers/response");
const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/sendResponse');
const catchAsync = require('../utils/catchAsync');
const { addProduct, getAllProducts, getSingleProduct, nerByProduct, findKeywords, getShopes, getSingleShop } = require('../services/productService');


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
    console.log(req.params.id)
    const result = await getSingleProduct(req.params.id)
    sendResponse(res, { statusCode: 200, data: result, message: 'User Retrieve successfully', success: true })
})

const nerByProducts = catchAsync(async (req, res) => {
    const result = await nerByProduct(req.query)
    sendResponse(res, { statusCode: 200, data: result, message: 'Near By Product Retrieve successfully', success: true })
})

const findKeyword = catchAsync(async (req, res) => {
    const result = await findKeywords(req.query)
    sendResponse(res, { statusCode: 200, data: result, message: 'Keywords Retrieve successfully', success: true })
})

const findShops = catchAsync(async (req, res) => {
    const result = await getShopes(req.query)
    sendResponse(res, { statusCode: 200, data: result, message: 'Shops Retrieve successfully', success: true })
})

const singleShop = catchAsync(async (req, res) => {
    const result = await getSingleShop(req.params.id)
    sendResponse(res, { statusCode: 200, data: result, message: 'Shop Retrieve successfully', success: true })
})


module.exports = { createProduct, allProduct, singleProduct, nerByProducts, findKeyword, findShops, singleShop }