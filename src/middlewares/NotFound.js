import httpStatus from "http-status";
const ApiNotFound = (req, res, next) => {
    return res.status(httpStatus.NOT_FOUND).json({
        status: false,
        message: "Api Not Found!",
        error: "",
    });
};
export default ApiNotFound;