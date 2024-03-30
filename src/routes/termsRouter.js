const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createOrUpdate, getAlls } = require('../controllers/termsController');


router.post('/create', auth('admin', 'user'), createOrUpdate);
router.get('/all', auth('admin', 'user'), getAlls);

module.exports = router;