const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const { createFavorite, allFavorites } = require('../controllers/favoriteController');


router.post('/add', auth('user'), createFavorite);
router.get('/', auth('user'), allFavorites);
// router.get('/user-wise-product', auth('user'), userWiseProduct);
// router.get('/near-product', nerByProducts);
// router.get('/keywords', findKeyword);
// // Shops
// router.get('/shops', auth('admin', 'user'), findShops);
// router.get('/single/:id', singleProduct);
// router.get('/:id', singleShop);


module.exports = router;