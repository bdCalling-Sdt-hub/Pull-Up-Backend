const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const productSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is must be given'], trim: true },
    description: { type: String, required: [true, 'Description is must be given'], trim: true },
    price: { type: String, required: [true, 'Price is required'], trim: true },
    image: {
        type: Object, required: false, default: {
            publicFileUrl: `${process.env.IMAGE_UPLOAD_BACKEND_DOMAIN}/uploads/product/user.jpg`,
            path: 'public\\uploads\\product\\user.png'
        }
    },
    keywords: { type: String, required: false },
}, { timestamps: true }, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
        },
    },
},

);

module.exports = mongoose.model('Product', productSchema);