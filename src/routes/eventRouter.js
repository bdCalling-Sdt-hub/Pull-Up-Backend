const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();

const fs = require('fs');
const userFileUploadMiddleware = require("../middlewares/fileUpload");
const { createEvent, allEvent, singleEvent } = require('../controllers/eventController');
const UPLOADS_FOLDER_USERS = "./public/uploads/product";
const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);

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

router.post('/create-event', auth('user'), [uploadUsers.single("image")], createEvent);
router.get('/', allEvent);
router.get('/:id', singleEvent);

module.exports = router;