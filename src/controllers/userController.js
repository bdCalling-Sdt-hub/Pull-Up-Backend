require("dotenv").config();
const response = require("../helpers/response");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const unlinkImage = require("../common/image/unlinkImage");
const {
  addUser,
  userSignIn,
  addManager,
  getUserByEmail,
  getAllUsers,
  getUserById,
  updateUser,
  loginWithPasscode,
  getSingleUser,
  emailVerification,
  forgetPassword,
  forgetPasswordVerifyOneTimeCode,
  resetUpdatePassword,
  upgradeAccount,
  updatedAccount,
  getUsersStatistics,
  getChangePassword,
  forgetPasswordApp,
  forgetPasswordVerifyOneTimeCodeApp,
  resetUpdatePasswordApp,
  getUserProfile,
  totalIncomeRatio,
  packagePurchaseRatio,
  deActiveUsers,
} = require("../services/userService");
const User = require("../models/User");
const sendResponse = require("../utils/sendResponse");
const catchAsync = require("../utils/catchAsync");

// create a user
const createUser = catchAsync(async (req, res) => {
  const result = await addUser(req.body);

  sendResponse(res, {
    statusCode: 201,
    data: result,
    message: "an otp sent to your email.",
    success: true,
  });
});

//Sign in
const signIn = catchAsync(async (req, res) => {
  const result = await userSignIn(req.body);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Sign In successfully",
    success: true,
  });
});

// Verify Email
const verifyEmail = catchAsync(async (req, res) => {
  const result = await emailVerification(req.body);

  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Email Verified Successfully",
    success: true,
  });
});

// Verify Email
const forgotPassword = catchAsync(async (req, res) => {
  const email = req?.body?.email ?? req?.user?.email;
  const result = await forgetPassword(email);

  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Sent One Time Code successfully",
    success: true,
  });
});

// Forget Password Verify One time Code successfully
const forgotPasswordVerifyOneTimeCode = catchAsync(async (req, res) => {
  const result = await forgetPasswordVerifyOneTimeCode(
    req.body,
    req?.user?.email ?? req?.body?.email
  );

  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "User verified successfully",
    success: true,
  });
});

// Forget Password Verify One time Code successfully
const resetUpdatedPassword = catchAsync(async (req, res) => {
  const result = await resetUpdatePassword(
    req.body,
    req?.user?.email ?? req?.body?.email
  );

  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Password updated successfully",
    success: true,
  });
});

// Forget password for app
const forgotPasswordApp = catchAsync(async (req, res) => {
  // const email = req?.body?.email ?? req?.user?.email
  const result = await forgetPasswordApp(req?.body);

  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Sent One Time Code successfully",
    success: true,
  });
});

// Forget Password Verify One time Code successfully for app
const forgotPasswordVerifyOneTimeCodeApp = catchAsync(async (req, res) => {
  const result = await forgetPasswordVerifyOneTimeCodeApp(req.body);

  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "User verified successfully",
    success: true,
  });
});

// Forget Password Verify One time Code successfully
const resetUpdatedPasswordApp = catchAsync(async (req, res) => {
  const result = await resetUpdatePasswordApp(req.body);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Password updated successfully",
    success: true,
  });
});

// Upgrade Account
const upgradedAccount = catchAsync(async (req, res) => {
  const result = await upgradeAccount(req.body, req.user.userId);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Upgrade Account Successfully",
    success: true,
  });
});

// Update account
const updateAccount = catchAsync(async (req, res) => {
 
  const result = await updatedAccount(req.body, req.user.email, req.files, req.ip);
  sendResponse(res, {                   
    statusCode: 200,
    data: result,
    message: "User updated successfully",
    success: true,
  });
});

// All User
const allUsers = catchAsync(async (req, res) => {
  const result = await getAllUsers(req.query);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Users Retrieve successfully",
    success: true,
  });
});

// Users Statistics
const usersStatistics = catchAsync(async (req, res) => {
  const result = await getUsersStatistics(req.query);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Users Retrieve successfully",
    success: true,
  });
});

// Users Statistics
const packagePurchaseRatios = catchAsync(async (req, res) => {
  const result = await packagePurchaseRatio(req.query);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Package Purchase Ratio successfully",
    success: true,
  });
});

// Users Statistics
const totalIncomeRatios = catchAsync(async (req, res) => {
  const result = await totalIncomeRatio(req.query);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Users Income Ratio successfully",
    success: true,
  });
});

// Update Profile
const updateProfile = catchAsync(async (req, res) => {
  const file = req.file;
  const result = await updateUser(req.body, { file });

  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "User Update successfully",
    success: true,
  });
});

// get Profile
const getProfile = catchAsync(async (req, res) => {
  console.log(req.user);
  const result = await getUserProfile(req.user.email);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Users Retrieve successfully",
    success: true,
  });
});

const singleUser = catchAsync(async (req, res) => {
  const result = await getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "User Retrieve successfully",
    success: true,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await getChangePassword(req.body, req.user.email);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Password Changed successfully",
    success: true,
  });
});

const deActiveUser = catchAsync(async (req, res) => {
  const result = await deActiveUsers(req.body, req.user.email);
  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "Password Changed successfully",
    success: true,
  });
});

module.exports = {
  signIn,
  createUser,
  verifyEmail,
  forgotPassword,
  forgotPasswordApp,
  forgotPasswordVerifyOneTimeCode,
  forgotPasswordVerifyOneTimeCodeApp,
  resetUpdatedPassword,
  resetUpdatedPasswordApp,
  upgradedAccount,
  allUsers,
  usersStatistics,
  packagePurchaseRatios,
  totalIncomeRatios,
  updateAccount,
  updateProfile,
  getProfile,
  singleUser,
  changePassword,
  deActiveUser,
};
