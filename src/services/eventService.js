const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const User = require('../models/User');
const QueryBuilder = require('../builder/QueryBuilder');
const Event = require('../models/Event');

// Create a new user
const addEvent = async (userBody, email, file) => {
    const { name, description, price, location, date } = userBody;

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
    if (user.accountType === 'organisation') {
        const event = await Event.create({
            name,
            description,
            price,
            location,
            image: imageUrl,
            userId: user._id
        });

        return event;
    } else {
        throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Account type not match')
    }
}

const getAllEvents = async (query) => {
    const eventModel = new QueryBuilder(Event.find(), query)
        .search()
        .filter()
        .paginate()
        .sort()
        .fields();

    const result = await eventModel.modelQuery;
    const meta = await eventModel.meta();
    return { result, meta }
}

const userWiseEvents = async (query) => {

    const productModel = new QueryBuilder(Event.find(), query)
        .search()
        .filter()
        .paginate()
        .sort()
        .fields();

    const result = await productModel.modelQuery;
    const meta = await productModel.meta();
    return { result, meta }
}

const getSingleEvent = async (id) => {
    const result = await Event.findById(id)
    return result
}




module.exports = {
    addEvent,
    getAllEvents,
    userWiseEvents,
    getSingleEvent
}