// routes/admin.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// POST notification
// router.post('/send-notification', async (req, res) => {
//   const { message, targetRole } = req.body;
//   try {
//     const notif = new Notification({ message, targetRole });
//     await notif.save();
//     res.status(201).json({ success: true, notif });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });
// router.get('/notif', async (req, res) => {
//   const role = req.query.role || 'all';
//   try {
//     const notifications = await Notification.find({
//       targetRole: { $in: [role, 'all'] }
//     }).sort({ createdAt: -1 }).limit(20);

//     res.json({ success: true, notifications });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     res.status(500).json({ success: false, message: 'Erreur serveur' });
//   }
// });
module.exports = router;
