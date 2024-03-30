const httpStatus = require("http-status");
const AppError = require("../errors/AppError");
const User = require("../models/User");
const TermsCondition = require("../models/TermsCondition");

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
    let termsCondition = await TermsCondition.findOne();

    if (!termsCondition) {
        // If no entry exists, create a new one
        termsCondition = new TermsCondition({ content });
        await termsCondition.save();
        return termsCondition
    }

    // If an entry exists, update its content
    termsCondition.content = content;
    await termsCondition.save();

    return termsCondition;

}

const getAll = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Find the Privacy Policy entry (assuming there's only one)
    const termsCondition = await TermsCondition.findOne();

    if (!termsCondition) {
        throw new AppError(httpStatus.NOT_FOUND, "Privacy Policy content not found");
    }

    // Remove HTML tags from the "about" content
    // const termsConditionContentWithoutTags = termsCondition.content.replace(/<\/?[^>]+(>|$)/g, "");

    // return res.status(200).json({ message: 'Privacy Policy content retrieved successfully', termsCondition: { ...termsCondition.toObject(), content: termsConditionContentWithoutTags } });

    return termsCondition;
}

module.exports = { getCreateOrUpdate, getAll }