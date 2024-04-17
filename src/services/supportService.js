const httpStatus = require("http-status");
const AppError = require("../errors/AppError");
const User = require("../models/User");
const Support = require("../models/Support");

const getCreateOrUpdate = async (body, userId) => {
    const { content } = body;

    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.role !== 'admin') {
        throw new AppError(httpStatus.NOT_FOUND, "You are not Authorization");
    }

    // Check if an Privacy Policy entry already exists
    let support = await Support.findOne();

    if (!support) {
        // If no entry exists, create a new one
        support = new Support({ content });
        await support.save();
        return support
    }

    // If an entry exists, update its content
    support.content = content;
    await support.save();

    return support;

}

const getAll = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Find the Privacy Policy entry (assuming there's only one)
    const support = await Support.findOne();

    if (!support) {
        throw new AppError(httpStatus.NOT_FOUND, "Privacy Policy content not found");
    }

    // Remove HTML tags from the "support" content
    // const supportContentWithoutTags = support.content.replace(/<\/?[^>]+(>|$)/g, "");

    // return res.status(200).json({ message: 'Privacy Policy content retrieved successfully', support: { ...support.toObject(), content: supportContentWithoutTags } });

    return support;
}

module.exports = { getCreateOrUpdate, getAll }