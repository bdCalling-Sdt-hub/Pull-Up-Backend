const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const User = require('../models/User');
const Product = require('../models/Product');
const QueryBuilder = require('../builder/QueryBuilder');
const { addNotification } = require('./notificationService');
const Favorite = require('../models/Favorite');

// Create a new user
const addProduct = async (userBody, email, file) => {
    let { name, description, price, keywords } = userBody;

    keywords = JSON.parse(keywords);

    // Check if the user already exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(httpStatus.CONFLICT, "User already exists! Please login")
    }

    let imageUrl;

    if (file) {
        imageUrl = {
            publicFileUrl: `${process.env.IMAGE_UPLOAD_BACKEND_DOMAIN}/uploads/product/${file?.filename}`,
            path: `uploads/product/${file.filename}`
        }
    }

    // Create the user in the database
    if (user.accountType === 'business') {
        const product = await Product.create({
            name,
            description,
            price,
            keywords,
            image: imageUrl,
            userId: user._id,
            address: user.location
        });


        const adminNotification = {
            message: `${user.name} Created New ${name} Product`,
            // receiver: req.body.participantId, When i sent admin 
            linkId: product._id,
            type: 'product',
            role: 'admin',
        }
        const adminNewNotification = await addNotification(adminNotification);
        // const roomId = 'admin-notification::' + req.body.participantId.toString();
        const roomId = 'admin-notification';
        io.emit(roomId, adminNewNotification)


        return product;
    } else {
        throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Account type not match')
    }
}

const getAllProducts = async (query, userId) => {

    const productModel = new QueryBuilder(Product.find(), query)
        .search()
        .filter()
        .paginate()
        .sort()
        .fields();

    const result = await productModel.modelQuery;

    const allProductIds = result.map(product => product._id);
    // console.log(allProductIds);

    let favorites = [];
    if (userId) {
        favorites = await Favorite.find({ userId, productId: { $in: allProductIds } });
    }

    // Create a map of product IDs to indicate whether each product is a favorite
    const favoriteMap = {};
    favorites.forEach(favorite => {
        favoriteMap[favorite.productId.toString()] = true;
    });

    // Add a new field indicating whether each product is in the user's favorite list
    const productsWithFavorite = result.map(product => {
        const isFavorite = favoriteMap[product._id.toString()] || false;
        return { ...product.toObject(), isFavorite };
    });

    const meta = await productModel.meta();
    return { result: productsWithFavorite, meta };
};


const userWiseProducts = async (query) => {

    const productModel = new QueryBuilder(Product.find(), query)
        .search()
        .filter()
        .paginate()
        .sort()
        .fields();

    const result = await productModel.modelQuery;
    const meta = await productModel.meta();
    return { result, meta }
}

const getSingleProduct = async (id) => {
    const result = await Product.findById(id)
    return result
}

const nerByProduct = async (query) => {
    const { longitude, latitude, accountType } = query;

    if (!query) {
        throw new AppError(httpStatus.NOT_FOUND, 'Params not found');
    }

    const neaByProduct = await User.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                key: "mapLocation",
                distanceField: "dist.calculated",
                maxDistance: parseFloat(5000) * 1609,
                // query: { category: "Parks" },
                // includeLocs: "dist.location",
                spherical: true
            }
        },
        {
            $match: {
                accountType: accountType
            }
        }
    ]);

    return neaByProduct;
}

const findKeywords = async (body) => {

    const uniqueKeywords = await Product.aggregate([

        // Unwind the array to get separate documents for each keyword
        { $unwind: "$keywords" },
        // Group by keyword and count occurrences
        {
            $group: {
                _id: "$keywords",
                count: { $sum: 1 }
            }
        },
        // Project to rename fields and sort by keyword
        {
            $project: {
                keyword: "$_id",
                count: 1,
                _id: 0
            }
        },
        // Sort by keyword alphabetically
        { $sort: { count: -1 } }
    ]);

    return uniqueKeywords

}

// Shops
const getShopes = async (query) => {
    const userModel = new QueryBuilder(User.find(), query)
        .search()
        .filter()
        .paginate()
        .sort()
        .fields();

    const result = await userModel.modelQuery;
    const meta = await userModel.meta();
    // const organisationUsers = result.filter(user => user.accountType === 'business');
    return { result, meta }
}

const getSingleShop = async (id) => {
    const result = await User.findById(id)
    return result
}


module.exports = {
    addProduct,
    getAllProducts,
    userWiseProducts,
    getSingleProduct,
    nerByProduct,
    findKeywords,
    getShopes,
    getSingleShop
}