const httpStatus = require("http-status");
const AppError = require("../errors/AppError");
const User = require("../models/User");
const About = require("../models/About");

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
    let about = await About.findOne();

    if (!about) {
        // If no entry exists, create a new one
        about = new About({ content });
        await about.save();
        return about
    }

    // If an entry exists, update its content
    about.content = content;
    await about.save();

    return about;

}

const getAll = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Find the Privacy Policy entry (assuming there's only one)
    const about = await About.findOne();

    if (!about) {
        throw new AppError(httpStatus.NOT_FOUND, "Privacy Policy content not found");
    }

    // Remove HTML tags from the "about" content
    // const aboutContentWithoutTags = about.content.replace(/<\/?[^>]+(>|$)/g, "");

    // return res.status(200).json({ message: 'Privacy Policy content retrieved successfully', about: { ...about.toObject(), content: aboutContentWithoutTags } });

    return about;
}

module.exports = { getCreateOrUpdate, getAll }