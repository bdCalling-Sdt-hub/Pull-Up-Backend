// const jwt = require('jsonwebtoken');
// const response = require("../helpers/response");
// const AppError = require('../errors/AppError');
// const httpStatus = require('http-status');

// const isValidUser = async (req, res, next) => {
//     try {
//         const { authorization } = req.headers;
//         let token;
//         let decodedData;
//         if (authorization && authorization.startsWith("Bearer")) {
//             token = authorization.split(" ")[1];
//             decodedData = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
//         }
//         if (!authorization || !decodedData) {
//             // return res.status(401).json(response({ status: 'Unauthorised', statusCode: '401', type: 'auth', message: req.t('unauthorised') }));
//             throw new AppError(httpStatus.UNAUTHORIZED, "unauthorised")

//         }
//         req.body.userId = decodedData._id;
//         req.body.userRole = decodedData.role;
//         req.body.userEmail = decodedData.email;
//         next();
//     } catch (error) {
//         console.log("Middleware Error", error.message)
//         // logger.error(error, req.originalUrl);
//         // return res.status(401).json(response({ status: 'Error', statusCode: '401', type: 'auth', message: req.t('exception-in-authorization') }));
//         // throw new AppError(httpStatus.UNAUTHORIZED, "exception-in-authorization")
//         next();
//     }
// };

// // const verifyRefreshToken = async (req, res, next) => {
// //     try {
// //         var refreshToken;
// //         var decodedData;
// //         if (req.headers['refresh-token'] && req.headers['refresh-token'].startsWith('Refresh-token ')) {
// //             refreshToken = req.headers['refresh-token'].split(' ')[1];
// //             decodedData = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
// //         }
// //         if (!refreshToken || !decodedData) {
// //             return res.status(401).json(response({ statusCode: 401, message: req.t('unauthorised'), status: "Error" }));
// //         }
// //         req.body.userId = decodedData._id;
// //         req.body.userRole = decodedData.role;
// //         req.body.userEmail = decodedData.email;
// //         next();
// //     } catch (error) {
// //         console.log("Middleware Error", error)
// //         // logger.error(error, req.originalUrl);
// //         return res.status(401).json(response({ status: 'Error', statusCode: '401', type: 'auth', message: req.t('exception-in-authorization') }));
// //     }
// // };


// module.exports = { isValidUser };


const httpStatus = require("http-status");
const AppError = require("../errors/AppError.js");
const catchAsync = require("../utils/catchAsync.js");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = (...userRoles) => {
    return catchAsync(async (req, res, next) => {

        const token = req?.headers?.authorization?.split(" ")[1];

        if (!token) {
            throw new AppError(httpStatus.UNAUTHORIZED, "you are not authorized!");
        }
        const decode = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
        if (!decode) {
            throw new AppError(httpStatus.UNAUTHORIZED, "invalid token");
        }
        const { role, userId, email } = decode;
        // const isUserExist = User.isUserExist(email);
        const isIdExit = User.findById(userId);
        // if (!isUserExist) {
        //     throw new AppError(httpStatus.NOT_FOUND, "user not found");
        // }
        if (!isIdExit) {
            throw new AppError(httpStatus.NOT_FOUND, "user not found");
        }
        if (userRoles && !userRoles.includes(role)) {
            throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized ");
        }
        req.user = decode;
        next();
    });
};
module.exports = auth;