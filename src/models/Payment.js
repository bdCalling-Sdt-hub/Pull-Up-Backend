const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    paymentData: { type: Object },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userAccountType: { type: String },
    packageDuration: { type: String },
    receiveId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
},
    { timestamps: true },

);

module.exports = mongoose.model('Payment', paymentSchema);