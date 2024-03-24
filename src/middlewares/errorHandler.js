// const logger = require('../helpers/logger');
const response = require('../helpers/response')
function notFoundHandler(req, res, next) {
    const requestedPath = req.originalUrl;
    next(new Error(`Requested content not found for path: ${requestedPath}`));
}


function errorHandler(err, req, res, next) {
    console.error('Error Handler--------->', err);
    // logger.error(err, req.originalUrl);
    res.status(500).json(response({ status: 'Error', statusCode: '500', type: err.name, message: err.message, data: null }));
}
module.exports = { notFoundHandler, errorHandler }