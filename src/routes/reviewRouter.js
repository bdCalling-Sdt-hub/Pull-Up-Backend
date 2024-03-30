const express = require('express');
const { createOrUpdate, getUsersReview } = require('../controllers/reviewController');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post('/:productId', auth('user'), createOrUpdate);
router.get('/', auth('user'), getUsersReview);
// router.get('/userReview', getUserReview);

module.exports = router;