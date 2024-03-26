const express = require('express');
const { createPackage, createPackagePrice } = require('../controllers/packageController');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/create-package', auth('admin'), createPackage);
router.post('/create-package-price/:id', auth('admin'), createPackagePrice);

module.exports = router;