const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    isFavorite: { type: String, enum: ['true', 'false'], default: 'false' },
},
    { timestamps: true },

);

module.exports = mongoose.model('Favorite', favoriteSchema);