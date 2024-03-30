const express = require('express');
const router = express.Router();
const { createOrUpdate, getAlls } = require('../controllers/privacyController');
const auth = require('../middlewares/auth');


router.post('/create', auth('admin', 'user'), createOrUpdate);
router.get('/all', auth('admin', 'user'), getAlls);

module.exports = router;