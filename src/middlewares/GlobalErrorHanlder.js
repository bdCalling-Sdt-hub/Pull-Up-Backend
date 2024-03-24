const { ZodError } = require("zod");
const handleValidationError = require("../errors/handleValidationError.js");
const handleCastError = require("../errors/HandleCastError.js");
const AppError = require("../errors/AppError.js");
const handleDuplicateError = require("../errors/handleDuplicateError.js");
const handleZodError = require("../errors/handleZodError.js");
// const config = require("../config/index.js");

const globalErrorHandler = (err, req, res, next) => {
    //setting default values
    let statusCode = 500;
    let message = "Something went wrong!";
    let errorSources = [
        {
            path: "",
            message: "Something went wrong",
        },
    ];
    if (err instanceof ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    } else if (err?.name === "ValidationError") {
        const simplifiedError = handleValidationError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    } else if (err?.name === "CastError") {
        const simplifiedError = handleCastError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    } else if (err?.code === 11000) {
        const simplifiedError = handleDuplicateError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSources = simplifiedError?.errorSources;
    } else if (err instanceof AppError) {
        statusCode = err?.statusCode;
        message = err.message;
        errorSources = [
            {
                path: "",
                message: err?.message,
            },
        ];
    } else if (err instanceof Error) {
        message = err.message;
        errorSources = [
            {
                path: "",
                message: err?.message,
            },
        ];
    }
    return res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err,
        stack: process.env.NODE_ENV === "development" ? err?.stack : null,
    });
};
module.exports = globalErrorHandler;