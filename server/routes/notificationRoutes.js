const express = require("express");

const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Get logged-in user's notifications
router.get("/", authMiddleware, getNotifications);


// Mark one notification as read
router.patch("/:id/read", authMiddleware, markNotificationRead);


// Mark all notifications as read
router.patch("/read-all", authMiddleware, markAllNotificationsRead);


module.exports = router;