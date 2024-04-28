require('dotenv').config();
const response = require("../helpers/response");
const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/sendResponse');
const catchAsync = require('../utils/catchAsync');
const { addProduct, getAllProducts, getSingleProduct, nerByProduct, findKeywords, getShopes, getSingleShop, userWiseProducts } = require('../services/productService');
const { addFavorite, getAllFavorite } = require('../services/favoriteService');


// create a user
const createFavorite = catchAsync(async (req, res) => {
    const result = await addFavorite(req.user.email, req.body);
    sendResponse(res, { statusCode: 201, data: result, message: 'Favorite Added Successfully', success: true });
});

const allFavorites = catchAsync(async (req, res) => {
    const result = await getAllFavorite(req.query)
    sendResponse(res, { statusCode: 200, data: result, message: 'Favorite Retrieve successfully', success: true })
});

const userWiseProduct = catchAsync(async (req, res) => {
    const result = await userWiseProducts(req.query);
    sendResponse(res, { statusCode: 200, data: result, message: 'User Wise Product Retrieve successfully', success: true })
});

const singleProduct = catchAsync(async (req, res) => {
    const result = await getSingleProduct(req.params.id)
    sendResponse(res, { statusCode: 200, data: result, message: 'User Retrieve successfully', success: true })
})


module.exports = {
    createFavorite,
    allFavorites,
    userWiseProduct,
    singleProduct,
}