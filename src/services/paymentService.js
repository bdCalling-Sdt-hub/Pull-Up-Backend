const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Product = require('../models/Product');
const Event = require('../models/Event');
const QueryBuilder = require('../builder/QueryBuilder');
const { default: mongoose } = require('mongoose');
const dayjs = require('dayjs');
const { addNotification } = require('./notificationService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a Payment
const addIntentPayment = async (body, email, packageDuration, userAccountType) => {

    // const paymentIntent = await stripe.paymentIntents.create({
    //     amount: Number(amount) * 100,
    //     currency: "usd",
    //     payment_method_types: ["card"],
    // });

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User not found');
    }

    console.log(user.accountType)
    console.log(user.packageDuration)

    const createdPayment = await Payment.create({
        paymentData: body,
        userId: user._id,
        userAccountType: userAccountType,
        packageDuration: packageDuration
    });

    createdPayment.save();

    return body;
};

const addConnectIntentPayment = async (body, email, productId) => {

    console.log(productId, body)
    const newAmount = body.amount;
    console.log("newAmount--->", newAmount)

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User not found');
    }

    const stripeConnectAccount = await Product.findById(productId);
    console.log(stripeConnectAccount.userId)

    const receiveUser = await User.findOne({ _id: stripeConnectAccount.userId });

    const stripeConnectAccountID = receiveUser.stripeConnectAccountId;
    console.log(stripeConnectAccountID)

    if (!stripeConnectAccountID) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Destination ID is not found for payment');
    }

    // const paymentIntent = await stripe.paymentIntents.create({
    //     amount: newAmount,
    //     currency: "usd",
    //     payment_method_types: ["card"],
    // });


    const onePercent = newAmount * 0.01;
    console.log("onePercent---->", onePercent); // Output: 1

    const transferAmount = (newAmount - onePercent);
    console.log("transferAmount--->", transferAmount);

    const transfer = await stripe.transfers.create({
        amount: transferAmount,
        currency: 'usd',
        // source_transaction: paymentIntent.id,
        destination: stripeConnectAccountID, //stripeConnectAccountID
        transfer_group: body.id,
    });

    console.log("transfer---->", transfer)


    const createdPayment = await Payment.create({
        paymentData: body, //paymentIntent == body
        userId: user._id,
        receiveId: receiveUser._id,
        productId: productId,
    });

    createdPayment.save();

    console.log("Product User Id", receiveUser._id)
    const userNotification = {
        message: `${user.name} Bought ${stripeConnectAccount.name}`,
        // receiver: req.body.participantId, When i sent admin 
        linkId: stripeConnectAccount._id,
        receiver: receiveUser._id,
        type: 'product',
        role: 'user',
    }
    const userNewNotification = await addNotification(userNotification);
    const roomId = 'user-notification::' + receiveUser._id.toString();
    // const roomId = 'admin-notification';
    io.emit(roomId, userNewNotification)

    return { clientSecret: body?.client_secret };
};

const addConnectIntentPaymentEvent = async (body, email, eventId) => {

    console.log("Event Id", eventId, body)
    const newAmount = body.amount;
    console.log("newAmount--->", newAmount)

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User not found');
    }

    const stripeConnectAccount = await Event.findById(eventId);
    console.log(stripeConnectAccount)

    const receiveUser = await User.findOne({ _id: stripeConnectAccount.userId });

    const stripeConnectAccountID = receiveUser.stripeConnectAccountId;
    console.log("Destination Id -----", stripeConnectAccountID)

    if (!stripeConnectAccountID) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Destination ID is not found for payment');
    }

    // const paymentIntent = await stripe.paymentIntents.create({
    //     amount: newAmount,
    //     currency: "usd",
    //     payment_method_types: ["card"],
    // });


    const onePercent = newAmount * 0.01;
    console.log("onePercent---->", onePercent); // Output: 1

    const transferAmount = (newAmount - onePercent);
    console.log("transferAmount--->", transferAmount);

    const transfer = await stripe.transfers.create({
        amount: transferAmount,
        currency: 'usd',
        // source_transaction: paymentIntent.id,
        destination: stripeConnectAccountID, //stripeConnectAccountID
        transfer_group: body.id,
    });

    console.log("transfer---->", transfer)


    const createdPayment = await Payment.create({
        paymentData: body, //paymentIntent == body
        userId: user._id,
        receiveId: receiveUser._id,
        eventId: eventId
    });

    createdPayment.save();

    const userNotification = {
        message: `${user.name} ${stripeConnectAccount.name} bought tickets to the event`,
        // receiver: req.body.participantId, When i sent admin 
        linkId: stripeConnectAccount._id,
        receiver: receiveUser._id,
        type: 'product',
        role: 'user',
    }
    const userNewNotification = await addNotification(userNotification);
    const roomId = 'user-notification::' + receiveUser._id.toString();
    // const roomId = 'admin-notification';
    io.emit(roomId, userNewNotification)

    return { clientSecret: body?.client_secret };
};

const getAllTransactions = async (query, email) => {
    console.log(query)

    const user = await User.findOne({ email });
    if (!user) {
        if (!user) {
            throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found")
        }
    }

    const paymentModel = new QueryBuilder(Payment.find().populate('userId'), query)
        .search()
        .filter()
        .paginate()
        .sort()
        .fields();

    const result = await paymentModel.modelQuery;
    console.log(result)
    const meta = await paymentModel.meta();

    return { result, meta }
}

const currentBalances = async (query, email, userId) => {

    console.log(userId)
    const { month, year, date } = query;

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found");
    }

    let matchStage = {};

    if (month && year) {
        const startDate = new Date(`${month} 1, ${year}`);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

        if (startDate && endDate) {
            // If startDate and endDate are provided, match by them
            matchStage = {
                $match: {
                    receiveId: new mongoose.Types.ObjectId(userId),
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            };
        }
    } else if (date) {
        const formattedDate = dayjs(date);
        const startOfDay = formattedDate.startOf('day').toDate(); // Start of the day
        const endOfDay = formattedDate.endOf('day').toDate(); // End of the day

        matchStage = {
            $match: {
                receiveId: new mongoose.Types.ObjectId(userId),
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }
        };
    }

    const aggregationPipeline = [];

    // Add the match stage
    aggregationPipeline.push(matchStage);

    // Add the $lookup stage properly
    aggregationPipeline.push({
        $lookup: {
            from: 'users',
            localField: 'receiveId',
            foreignField: '_id',
            as: 'userId'
        }
    });

    aggregationPipeline.push({
        $unwind: '$userId'
    })

    const result = await Payment.aggregate(aggregationPipeline);

    return result;
};




module.exports = {
    addIntentPayment,
    addConnectIntentPayment,
    addConnectIntentPaymentEvent,
    getAllTransactions,
    currentBalances
}