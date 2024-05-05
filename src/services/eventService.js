const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const User = require('../models/User');
const QueryBuilder = require('../builder/QueryBuilder');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const { default: mongoose } = require('mongoose');

// Create a new user
const addEvent = async (userBody, email, file) => {
    const { name, description, price, location, dateTime } = userBody;

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
            userId: user._id,
            dateTime,
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

const getEventHistory = async (userId) => {

    const result = await Payment.find({ userId: userId, eventId: { $exists: true } }).populate('userId eventId').select('userId eventId')
    return result
}

const getReceiverEventHistory = async (userId) => {
    console.log(userId);
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
            $match: { 'receiveId.accountType': 'organisation' } // Filter by accountType 'business'
        },
        {
            $lookup: {
                from: 'events',
                localField: 'eventId',
                foreignField: '_id',
                as: 'eventId'
            }
        },
        {
            $unwind: '$eventId'
        },
        {
            $project: {
                receiveId: 1,
                eventId: 1
            }
        }
    ]);

    return result
}

const eventJoin = async () => {

    const eventData = await Event.aggregate([
        {
            $lookup: {
                from: "payments",
                let: { eventId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$eventId", "$$eventId"] }
                        }
                    }
                ],
                as: "paymentData"
            }
        },
        {
            $unwind: {
                path: "$paymentData",
                preserveNullAndEmptyArrays: true // Preserve documents without a matching payment
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "paymentData.userId",
                foreignField: "_id",
                as: "userData"
            }
        },
        {
            $unwind: {
                path: "$userData",
                preserveNullAndEmptyArrays: true // Preserve documents without a matching payment
            }
        },
        {
            $group: {
                _id: "$_id", // Group by event ID
                eventData: { $first: "$$ROOT" }, // Preserve eventData
                userData: { $push: "$userData" } // Collect user data for each group
            }
        }
    ]);

    // console.log(eventData);




    return eventData;

}

const getSingleEvent = async (id) => {
    const result = await Event.findById(id)
    return result
}




module.exports = {
    addEvent,
    getAllEvents,
    userWiseEvents,
    getEventHistory,
    getReceiverEventHistory,
    eventJoin,
    getSingleEvent
}