const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const User = require('../models/User');
const Product = require('../models/Product');
const QueryBuilder = require('../builder/QueryBuilder');
const { addNotification } = require('./notificationService');
const Favorite = require('../models/Favorite');
const Payment = require('../models/Payment');
const { default: mongoose } = require('mongoose');

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

const getProductHistory = async (userId) => {
    console.log(userId);
    const result = await Payment.find({ userId: userId }).populate('userId productId').select('userId productId')
    return result
}

const getReceiverProductHistory = async (userId) => {
    // Find payments where receiveId matches the provided userId
    const result = await Payment.aggregate([
        {
            $match: { receiveId: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'receiveId',
                foreignField: '_id',
                as: 'receiveId'
            }
        },
        {
            $unwind: '$receiveId'
        },
        {
            $match: { 'receiveId.accountType': 'business' } // Filter by accountType 'business'
        },
        {
            $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'productId'
            }
        },
        {
            $unwind: '$productId'
        },
        {
            $project: {
                receiveId: 1,
                productId: 1
            }
        }
    ]);

    return result
}

// const nerByProduct = async (query) => {
//     const { longitude, latitude, accountType } = query;

//     if (!longitude || !latitude || !accountType) {
//         throw new AppError(httpStatus.BAD_REQUEST, 'Missing required parameters: longitude, latitude, or accountType');
//     }

//     // Ensure the longitude and latitude are numbers
//     const lon = parseFloat(longitude);
//     const lat = parseFloat(latitude);

//     if (isNaN(lon) || isNaN(lat)) {
//         throw new AppError(httpStatus.BAD_REQUEST, 'Invalid longitude or latitude');
//     }

//     try {
//         // Check if the geospatial index exists
//         const indexes = await User.collection.indexes();
//         const hasGeoIndex = indexes.some(index => index.key && index.key.mapLocation === '2dsphere');

//         if (!hasGeoIndex) {
//             throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Geospatial index on mapLocation not found');
//         }

//         // Run the aggregation query
//         const neaByProduct = await User.aggregate([
//             {
//                 $geoNear: {
//                     near: { type: "Point", coordinates: [lon, lat] },
//                     key: "mapLocation",
//                     distanceField: "dist.calculated",
//                     maxDistance: 5000 * 1609, // Convert miles to meters
//                     spherical: true
//                 }
//             },
//             {
//                 $match: {
//                     accountType: accountType
//                 }
//             }
//         ]);

//         return neaByProduct;
//     } catch (error) {
//         throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
//     }
// }


const nerByProduct = async (query) => {
    const { longitude, latitude, accountType } = query;
    console.log("Hello Query", longitude, latitude, accountType)

    if (!query) {
        throw new AppError(httpStatus.NOT_FOUND, 'Params not found');
    }

    const neaByProduct = await User.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                key: "mapLocation",
                distanceField: "dist.calculated",
                maxDistance: parseFloat(10000) * 1609,
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

const getSingleShopByProduct = async (id) => {
    // const user = await User.findById(id)

    // if(!user){
    //     throw new AppError(httpStatus.NOT_FOUND, "User not found")
    // }

    const product = await Product.find({ userId: id })

    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    return product;
}


module.exports = {
    addProduct,
    getAllProducts,
    userWiseProducts,
    getSingleProduct,
    getProductHistory,
    getReceiverProductHistory,
    nerByProduct,
    findKeywords,
    getShopes,
    getSingleShop,
    getSingleShopByProduct
}