const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Product = require('../models/Product');
const QueryBuilder = require('../builder/QueryBuilder');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a Payment
const addIntentPayment = async (body, email) => {

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


    const createdPayment = await Payment.create({
        paymentData: body,
        userId: user._id,
        userAccountType: user.accountType,
    });

    createdPayment.save();

    return body;
};

const addConnectIntentPayment = async (body, email) => {
    const { amount, productId } = body;
    console.log(productId)
    const newAmount = Number(amount) * 100

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

    const paymentIntent = await stripe.paymentIntents.create({
        amount: newAmount,
        currency: "usd",
        payment_method_types: ["card"],
    });


    const onePercent = newAmount * 0.01;
    console.log(onePercent); // Output: 1

    const transferAmount = (newAmount - onePercent);

    // Check available balance in Stripe test account
    // const balance = await stripe.balance.retrieve();
    // const availableBalance = balance.available[0].amount;

    // if (transferAmount > availableBalance) {
    //     throw new AppError(httpStatus.UNAUTHORIZED, "Insufficient funds in Stripe test account");
    // }

    const transfer = await stripe.transfers.create({
        amount: transferAmount,
        currency: 'usd',
        // source_transaction: paymentIntent.id,
        destination: stripeConnectAccountID, //stripeConnectAccountID
        transfer_group: 'ORDER_95',
    });

    console.log(transfer)


    const createdPayment = await Payment.create({
        paymentData: paymentIntent,
        userId: user._id,
        receiveId: receiveUser._id
    });

    createdPayment.save();

    return { clientSecret: paymentIntent?.client_secret };
};

const getAllTransactions = async (query, email) => {
    console.log(query)

    const user = await User.findOne({ email });
    if (!user) {
        if (!user) {
            throw new AppError(httpStatus.UNAUTHORIZED, "User Not Found")
        }
    }

    const paymentModel = new QueryBuilder(Payment.find().populate('userId'), await query)
        .search()
        .filter()
        .paginate()
        .sort()
        .fields();

    const result = await paymentModel.modelQuery;
    const meta = await paymentModel.meta();

    return { result, meta }
}

module.exports = {
    addIntentPayment,
    addConnectIntentPayment,
    getAllTransactions
}