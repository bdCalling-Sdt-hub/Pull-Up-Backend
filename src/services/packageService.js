const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const Package = require('../models/Package');
const User = require('../models/User');

// Create a new user
const addPackage = async (userBody, email) => {
    const { accountType } = userBody;

    // Check if the user already exists
    const userExist = await User.findOne({ email: email });
    if (!userExist) {
        throw new AppError(httpStatus.CONFLICT, "User already exists! Please login")
    }

    // Create the user in the database
    const package = await Package.create({
        accountType
    });

    return package;
}

const addPackagePrice = async (id, body) => {
    const result = await Package.findByIdAndUpdate(id, body, { new: true });
    return result;
}


module.exports = {
    addPackage,
    addPackagePrice
}