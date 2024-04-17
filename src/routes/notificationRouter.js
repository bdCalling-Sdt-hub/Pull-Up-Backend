const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getAllNotifications } = require('../controllers/notificationController');

router.get('/', auth('admin', 'user'), getAllNotifications);

module.exports = router;