const httpStatus = require('http-status');
const AppError = require('../errors/AppError');
const Payment = require('../models/Payment');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a Payment
const addIntentPayment = async (amount, email) => {
    const { amount } = amount;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: "usd",
        payment_method_types: ["card"],
    });


    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User not found');
    }


    const createdPayment = await Payment.create({
        paymentIntent,
        userId: user._id,
    });

    createdPayment.save();

    return paymentIntent?.client_secret;
};

module.exports = {
    addIntentPayment,
}