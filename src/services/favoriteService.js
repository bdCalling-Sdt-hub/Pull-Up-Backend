const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const User = require('../models/User');
const Product = require('../models/Product');
const QueryBuilder = require('../builder/QueryBuilder');
const { addNotification } = require('./notificationService');
const Favorite = require('../models/Favorite');

// Create a new user
const addFavorite = async (email, body) => {

    const { id } = body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const existingFavorite = await Favorite.findOne({
        userId: user.id,
        productId: id
    });

    if (existingFavorite) {
        // If the favorite already exists, remove it
        await Favorite.findByIdAndDelete(existingFavorite._id);
        return { message: 'Favorite removed' };
    } else {
        // If the favorite doesn't exist, create a new one
        const product = await Product.findOne({ _id: id });
        if (!product) {
            throw new AppError(httpStatus.NOT_FOUND, "Product not found");
        }

        const favorite = await Favorite.create({
            userId: user.id,
            productId: id,
            isFavorite: true,
        });

        return favorite;
    }
};

const getAllFavorite = async (query) => {
    const productModel = new QueryBuilder(Favorite.find(), query)
        .search()
        .filter()
        .paginate()
        .sort()
        .fields();

    const result = await productModel.modelQuery;
    const meta = await productModel.meta();
    return { result, meta }
}


module.exports = {
    addFavorite,
    getAllFavorite
}