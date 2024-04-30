const express = require('express');
const { signUp, signIn, updateProfile, allUsers, singleUser, createUser, verifyEmail, forgotPassword, forgotPasswordVerifyOneTimeCode, resetUpdatedPassword, upgradedAccount, updateAccount, usersStatistics, changePassword, forgotPasswordApp, forgotPasswordVerifyOneTimeCodeApp, resetUpdatedPasswordApp, getProfile, totalIncomeRatios, packagePurchaseRatios } = require('../controllers/userController');
const router = express.Router();
const fs = require('fs');
const userFileUploadMiddleware = require("../middlewares/fileUpload");

const UPLOADS_FOLDER_USERS = "./public/uploads/users";
const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);
const { isValidUser, verifyRefreshToken } = require('../middlewares/auth')
const validationMiddleware = require('../middlewares/user/signupValidation');
const auth = require('../middlewares/auth');

if (!fs.existsSync(UPLOADS_FOLDER_USERS)) {
    // If not, create the folder
    fs.mkdirSync(UPLOADS_FOLDER_USERS, { recursive: true }, (err) => {
        if (err) {
            console.error("Error creating uploads folder:", err);
        } else {
            console.log("Uploads folder created successfully");
        }
    });
}


// User 
router.post('/create-user', createUser);
router.post('/sign-in', signIn);
router.post('/verify-email', verifyEmail);
// Dashboard
router.patch('/forget-password', auth('admin', 'user'), forgotPassword);
router.patch('/fp-verify-code', auth('admin', 'user'), forgotPasswordVerifyOneTimeCode);
router.patch('/update-password', auth('admin', 'user'), resetUpdatedPassword);
// change password
router.patch('/change-password', auth('admin', 'user'), changePassword);

// App 
router.patch('/forgot-password', forgotPasswordApp);
router.patch('/verify-code', forgotPasswordVerifyOneTimeCodeApp);
router.patch('/updated-password', resetUpdatedPasswordApp);

// Account Upgrade
router.post('/upgraded-account', auth('user'), upgradedAccount);
router.post('/update-account', auth('user'), [uploadUsers.single("image")], updateAccount);

// User
router.get('/', auth('admin'), allUsers);
router.get('/user-statistics', auth('admin'), usersStatistics);
router.get('/package-purchase-ratio', packagePurchaseRatios);
router.get('/income-ratio', totalIncomeRatios);
router.get('/profile', auth('admin', 'user'), getProfile);
router.patch('/', [uploadUsers.single("image")], updateProfile);


router.get('/:id', auth('manager', 'user'), singleUser);


module.exports = router;