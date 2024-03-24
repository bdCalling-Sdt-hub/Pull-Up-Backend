const User = require('../../models/User');
const response = require('../../helpers/response');
// const logger = require('../../helpers/logger');

function validateEmail(email) {
    return /^[a-zA-ZÀ-ÖØ-öø-ÿ0-9._%+-]+@[a-zA-ZÀ-ÖØ-öø-ÿ0-9.-]+\.[a-zA-ZÀ-ÖØ-öø-ÿ]{2,}$/.test(email);
}

function validatePassword(password) {
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-ZÀ-ÖØ-öø-ÿ]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= 8 && hasNumber && (hasLetter || hasSpecialChar);
}

const validationMiddleware = async (req, res, next) => {
    try {
        const { name, userName, email, phoneNumber, password } = req.body;
        let errors = [];

        const user = await User.findOne({ email });
        if (user) {
            req.body.existingUser = user;
        }

        if (!name) {
            errors.push({ field: 'name', message: req.t('name-required') });
        }

        if (!userName) {
            errors.push({ field: 'userName', message: req.t('user-name-required') });
        }

        if (!phoneNumber) {
            errors.push({ field: 'phoneNumber', message: req.t('phoneNumber-required') });
        }

        if (!validateEmail(email)) {
            errors.push({ field: 'email', message: req.t('email-format-error') });
        }

        if (!validatePassword(password)) {
            errors.push({ field: 'password', message: req.t('password-format-error') });
        }

        if (Object.keys(errors).length !== 0) {
            // logger.error('Sign up validation error', 'sign-up middleware');
            return res.status(422).json(response({ status: 'Error', statusCode: '422', type: "sign-up", message: req.t('validation-error'), errors: errors }));
        }
        next(); // Continue to the next middleware or route handler
    }
    catch (error) {
        // logger.error(error, req.originalUrl);
        console.error(error);
    }
};


module.exports = validationMiddleware;