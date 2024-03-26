const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is must be given'], trim: true },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: [true, 'Email should be unique'],
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v);
            },
            message: 'Please enter a valid Email'
        }
    },
    phoneNumber: { type: String, required: [true, 'Phone number is required'], trim: true },
    password: { type: String, required: [true, 'Password must be given'], set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10)) },
    image: {
        type: Object, required: false, default: {
            publicFileUrl: `${process.env.IMAGE_UPLOAD_BACKEND_DOMAIN}/uploads/users/user.jpg`,
            path: 'public\\uploads\\users\\user.png'
        }
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    oneTimeCode: { type: String, required: false },
    emailVerified: { type: Boolean, default: false },
    accountType: { type: String },
    businessName: { type: String },
    businessNumber: { type: String },
    businessEmail: { type: String },
    businessDescription: { type: String },
    businessWebsite: { type: String },

    organisationName: { type: String },
    organisationNumber: { type: String },
    organisationEmail: { type: String },
    organisationDescription: { type: String },
    organisationWebsite: { type: String },

    businessHours: { type: String },
    location: { type: String },
    mapLocation: {
        type: {
            latitude: Number,
            longitude: Number
        }
    },
    packageDuration: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    activationDate: { type: Date },
    expirationDate: { type: Date },
}, { timestamps: true }, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
        },
    },
},

);

module.exports = mongoose.model('User', userSchema);