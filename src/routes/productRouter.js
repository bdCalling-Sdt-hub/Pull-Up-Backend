const express = require('express');
const auth = require('../middlewares/auth');
const { createProduct, allProduct, singleProduct, nerByProducts, findKeyword, findShops, singleShop } = require('../controllers/productController');
const router = express.Router();

const fs = require('fs');
const userFileUploadMiddleware = require("../middlewares/fileUpload");
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

router.post('/create-product', auth('user'), [uploadUsers.single("image")], createProduct);
router.get('/', allProduct);
router.get('/near-product', nerByProducts);
router.get('/keywords', findKeyword);
// Shops
router.get('/shops', auth('admin'), findShops);
router.get('/:id', singleShop);
router.get('/:id', singleProduct);

module.exports = router;