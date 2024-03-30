const httpStatus = require("http-status");
const AppError = require("../errors/AppError");
const PrivacyPolicy = require("../models/PrivacyPolicy");
const User = require("../models/User");

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
    let privacyPolicy = await PrivacyPolicy.findOne();

    if (!privacyPolicy) {
        // If no entry exists, create a new one
        privacyPolicy = new PrivacyPolicy({ content });
        await privacyPolicy.save();
        return privacyPolicy
    }

    // If an entry exists, update its content
    privacyPolicy.content = content;
    await privacyPolicy.save();

    return privacyPolicy;

}

const getAll = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Find the Privacy Policy entry (assuming there's only one)
    const privacyPolicy = await PrivacyPolicy.findOne();

    if (!privacyPolicy) {
        throw new AppError(httpStatus.NOT_FOUND, "Privacy Policy content not found");
    }

    // Remove HTML tags from the "about" content
    // const privacyPolicyContentWithoutTags = privacyPolicy.content.replace(/<\/?[^>]+(>|$)/g, "");

    // return res.status(200).json({ message: 'Privacy Policy content retrieved successfully', privacyPolicy: { ...privacyPolicy.toObject(), content: privacyPolicyContentWithoutTags } });

    return privacyPolicy;
}

module.exports = { getCreateOrUpdate, getAll }