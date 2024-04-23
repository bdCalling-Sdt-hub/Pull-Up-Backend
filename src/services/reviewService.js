const httpStatus = require("http-status");
const AppError = require("../errors/AppError");
const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");

const createAndUpdateReview = async (body, productId, userId) => {
    const { rating, comment } = body;

    const loginUser = await User.findById(userId);

    const product = await Product.findById(productId);

    if (!productId) {
        throw new AppError(httpStatus.NOT_FOUND, 'Product Id not found')
    }

    if (Number(rating) > 5) {
        throw new AppError(httpStatus.LENGTH_REQUIRED, 'Review Rating Must be 5*')
    }

    if (comment.length >= 20) {
        throw new AppError(httpStatus.LENGTH_REQUIRED, 'Review Comment Must be 20 Char')
    }

    // const review = await Review.create({
    //     userId: userId,
    //     hostId: product.userId,
    //     productId,
    //     reviewer: loginUser.name,
    //     rating,
    //     comment
    // })

    // Create or update the review
    const review = await Review.findOneAndUpdate(
        { userId, productId },
        {
            userId,
            hostId: product.userId,
            productId,
            reviewer: loginUser.name,
            rating,
            comment
        },
        { upsert: true, new: true }
    );

    // Find all reviews for the product
    const reviews = await Review.find({ productId });

    // Calculate total rating and count of reviews
    let totalRating = 0;
    let reviewCount = reviews.length;

    // Calculate total rating
    reviews.forEach((review) => {
        totalRating += review.rating;
    });

    // Calculate average rating
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    loginUser.averageRating = averageRating;
    product.averageRating = averageRating;
    await loginUser.save();
    await product.save();

    return review
}

const getUserReview = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const review = await Review.find({ userId: user._id })
    return review
}


module.exports = {
    createAndUpdateReview,
    getUserReview
}