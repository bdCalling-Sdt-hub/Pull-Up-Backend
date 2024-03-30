const { createAndUpdateReview, getUserReview } = require("../services/reviewService");
const catchAsync = require("../utils/catchAsync");
const sendResponse = require("../utils/sendResponse");

const createOrUpdate = catchAsync(async (req, res) => {
    const result = await createAndUpdateReview(req.body, req.params.productId, req.user.userId);
    sendResponse(res, { statusCode: 200, data: result, message: "Review Added successfully", success: true });
})

const getUsersReview = catchAsync(async (req, res) => {
    const result = await getUserReview(req.user.userId);
    sendResponse(res, { statusCode: 200, data: result, message: "Review Added successfully", success: true });
})

module.exports = { createOrUpdate, getUsersReview }