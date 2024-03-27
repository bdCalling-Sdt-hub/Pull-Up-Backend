const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const User = require('../models/User');
const Product = require('../models/Product');
const QueryBuilder = require('../builder/QueryBuilder');

// Create a new user
const addProduct = async (userBody, email, file) => {
    const { name, description, price, keywords } = userBody;

    // Check if the user already exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(httpStatus.CONFLICT, "User already exists! Please login")
    }

    let imageUrl;

    if (file) {
        imageUrl = {
            publicFileUrl: `${process.env.IMAGE_UPLOAD_BACKEND_DOMAIN}/uploads/product/${file?.filename}`,
            path: `public/uploads/product/${file.filename}`
        }
    }

    // Create the user in the database
    if (user.accountType === 'business') {
        const product = await Product.create({
            name,
            description,
            price,
            keywords,
            image: imageUrl
        });

        return product;
    } else {
        throw new AppError(httpStatus[400], 'Account type not match')
    }
}

const getAllProducts = async (query) => {
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


module.exports = {
    addProduct,
    getAllProducts,
    getSingleProduct
}