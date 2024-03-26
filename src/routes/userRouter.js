const express = require('express');
const { signUp, signIn, updateProfile, allUsers, singleUser, createUser, verifyEmail, forgotPassword, forgotPasswordVerifyOneTimeCode, resetUpdatedPassword, upgradedAccount, updateAccount } = require('../controllers/userController');
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
router.post('/forgot-password', forgotPassword);
router.post('/fp-verify-code', forgotPasswordVerifyOneTimeCode);
router.post('/reset-update-password', resetUpdatedPassword);


// Account Upgrade
router.post('/upgraded-account', auth('user'), upgradedAccount);
router.post('/update-account', auth('user'), [uploadUsers.single("image")], updateAccount);



router.get('/', auth('manager'), allUsers);
router.get('/:id', auth('manager', 'user'), singleUser);
router.put('/', [uploadUsers.single("image")], updateProfile);

module.exports = router;