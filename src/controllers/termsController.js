const { getCreateOrUpdate, getAll } = require("../services/TermsCondition")
const catchAsync = require("../utils/catchAsync")
const sendResponse = require("../utils/sendResponse")

const createOrUpdate = catchAsync(async (req, res) => {
    const result = await getCreateOrUpdate(req.body, req.user.userId)
    sendResponse(res, { statusCode: 200, data: result, message: 'Terms Condition Added successfully', success: true })
})

const getAlls = catchAsync(async (req, res) => {
    const result = await getAll(req.user.userId)
    sendResponse(res, { statusCode: 200, data: result, message: 'Terms Condition Retrieve successfully', success: true })
})

module.exports = { createOrUpdate, getAlls }