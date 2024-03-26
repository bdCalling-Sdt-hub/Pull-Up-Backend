require('dotenv').config();
const response = require("../helpers/response");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const unlinkImage = require('../common/image/unlinkImage')
const { addUser, userSignIn, addManager, getUserByEmail, getAllUsers, getUserById, updateUser, loginWithPasscode, getSingleUser, emailVerification, forgetPassword, forgetPasswordVerifyOneTimeCode, resetUpdatePassword, upgradeAccount, updatedAccount } = require('../services/userService')
const User = require('../models/User');
const sendResponse = require('../utils/sendResponse');
const catchAsync = require('../utils/catchAsync');


// create a user
const createUser = catchAsync(async (req, res) => {
    const result = await addUser(req.body);

    sendResponse(res, { statusCode: 201, data: result, message: 'User Create Successfully', success: true });
});

//Sign in
const signIn = catchAsync(async (req, res) => {
    const result = await userSignIn(req.body)
    sendResponse(res, { statusCode: 200, data: result, message: 'Sign In successfully', success: true })
});

// Verify Email
const verifyEmail = catchAsync(async (req, res) => {
    const result = await emailVerification(req.body)

    sendResponse(res, { statusCode: 200, data: result, message: 'Email Verify Successfully', success: true });
});


// Verify Email
const forgotPassword = catchAsync(async (req, res) => {
    const result = await forgetPassword(req.body)

    sendResponse(res, { statusCode: 200, data: result, message: 'Sent One Time Code successfully', success: true });
});


// Forget Password Verify One time Code successfully
const forgotPasswordVerifyOneTimeCode = catchAsync(async (req, res) => {
    const result = await forgetPasswordVerifyOneTimeCode(req.body)

    sendResponse(res, { statusCode: 200, data: result, message: 'User verified successfully', success: true });
});


// Forget Password Verify One time Code successfully
const resetUpdatedPassword = catchAsync(async (req, res) => {
    const result = await resetUpdatePassword(req.body)

    sendResponse(res, { statusCode: 200, data: result, message: 'Password updated successfully', success: true });
});


// Upgrade Account
const upgradedAccount = catchAsync(async (req, res) => {
    const result = await upgradeAccount(req.body, req.user.userId)
    sendResponse(res, { statusCode: 200, data: result, message: 'Upgrade Account Successfully', success: true });
});

// Update account
const updateAccount = catchAsync(async (req, res) => {
    const file = req.file;
    const result = await updatedAccount(req.body, req.user.email, file);
    sendResponse(res, { statusCode: 200, data: result, message: "User updated successfully", success: true });
})





const updateProfile = catchAsync(async (req, res) => {
    const file = req.file;
    const result = await updateUser(req.body, { file })

    sendResponse(res, { statusCode: 200, data: result, message: 'User Update successfully', success: true })
});

const allUsers = catchAsync(async (req, res) => {
    const result = await getAllUsers(req.query)
    sendResponse(res, { statusCode: 200, data: result, message: 'Users Retrieve successfully', success: true })
});
const singleUser = catchAsync(async (req, res) => {
    const result = await getSingleUser(req.params.id)
    sendResponse(res, { statusCode: 200, data: result, message: 'User Retrieve successfully', success: true })
})


module.exports = { signIn, createUser, verifyEmail, forgotPassword, forgotPasswordVerifyOneTimeCode, resetUpdatedPassword, upgradedAccount, updateAccount, updateProfile, allUsers, singleUser }