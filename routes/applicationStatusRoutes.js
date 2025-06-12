
const express = require("express");
const router = express.Router();
const controller = require("../controllers/applicationStatusController");
const { requireAuthUser}=require("../middlewares/authMiddleware");

router.put("/setDecision", requireAuthUser, controller.setDecision);

router.get('/getAllNotifications',requireAuthUser,controller.getAllNotifications);
router.get("/getMyNotifications", requireAuthUser, controller.getMyNotifications);
router.get('/getUnreadNotificationCount', requireAuthUser, controller.getUnreadNotificationCount);

router.put("/markAllNotificationsAsRead", requireAuthUser, controller.markAllNotificationsAsRead);

module.exports = router;
