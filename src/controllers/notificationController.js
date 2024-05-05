require('dotenv').config();
const { getNotifications, userNotifications } = require('../services/notificationService');
const sendResponse = require('../utils/sendResponse');
const catchAsync = require('../utils/catchAsync');

// const getAllNotifications = async (req, res) => {

//   const result = await getNotifications(req.query)
//   sendResponse(res, { statusCode: 200, data: result, message: 'Notification successfully', success: true })

//   // console.log(req.user.role);
//   // try {
//   //   const page = Number(req.query.page) || 1;
//   //   const limit = Number(req.query.limit) || 10;
//   //   const options = {
//   //     page, limit
//   //   }
//   //   const role = req.user.role;
//   //   var filter = {};
//   //   if (role === 'user') {
//   //     filter.receiver = req.body.userId;
//   //     filter.role = role;
//   //   }
//   //   else {
//   //     filter.role = role;
//   //   }
//   //   const { notificationList, pagination } = await getNotifications(filter, options);
//   //   return res.status(200).json(response({ status: 'Success', statusCode: '200', message: req.t('notification-list'), data: { notificationList, pagination } }));
//   // }
//   // catch (error) {
//   //   console.error(error);
//   //   logger.error(error.message, req.originalUrl);
//   //   return res.status(500).json(response({ status: 'Error', statusCode: '500', type: 'termsOfService', message: req.t('server-error') }));
//   // }
// }

const getAllNotifications = catchAsync(async (req, res) => {
  const result = await getNotifications(req.query)
  sendResponse(res, { statusCode: 200, data: result, message: 'Notification successfully', success: true })
});
const getUserNotifications = catchAsync(async (req, res) => {
  req.query.receiver = req.user?.userId;
  const result = await userNotifications(req.query)
  sendResponse(res, { statusCode: 200, data: result, message: 'Notification successfully', success: true })
});

module.exports = {
  getAllNotifications,
  getUserNotifications
}