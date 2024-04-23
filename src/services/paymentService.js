const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Product = require('../models/Product');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a Payment
const addIntentPayment = async (body, email) => {
    const { amount } = body;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount) * 100,
        currency: "usd",
        payment_method_types: ["card"],
    });

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User not found');
    }


    const createdPayment = await Payment.create({
        paymentData: paymentIntent,
        userId: user._id,
    });

    createdPayment.save();

    return { clientSecret: paymentIntent?.client_secret };
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

module.exports = {
    addIntentPayment,
    addConnectIntentPayment
}