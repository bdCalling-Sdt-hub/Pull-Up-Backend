const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getAllNotifications, getUserNotifications } = require('../controllers/notificationController');

router.get('/', auth('admin'), getAllNotifications);
router.get('/user-notification', auth('user'), getUserNotifications);

module.exports = router;