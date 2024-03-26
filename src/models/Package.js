const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    accountType: { type: String, enum: ['shopping', 'business', 'organization'], },
    packageDetails: [
        {
            packageDuration: { type: String, enum: ['daily', 'weekly', 'monthly'], },
            packagePrice: { type: Number },
        }
    ]


},
    { timestamps: true },

);

module.exports = mongoose.model('Package', packageSchema);