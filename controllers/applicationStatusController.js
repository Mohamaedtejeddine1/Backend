// controllers/applicationStatusController.js
const ApplicationStatus = require("../models/applicationStatusSchema");
const Notification = require("../models/Notification"); 
const userModel=require("../models/userSchema"); 
 const Offre = require("../models/offreSchema"); 


exports.setDecision = async (req, res) => {
  try {
    const { offerTitle, email, status, comment } = req.body;

    // Check if the status is valid
    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be Accepted or Rejected" });
    }

    // Find candidate by email
    const candidate = await userModel.findOne({ email });
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

  
    const offer = await Offre.findOne({ titre: offerTitle }); 
    if (!offer) return res.status(404).json({ error: "Offer not found" });

    
    const result = await ApplicationStatus.findOneAndUpdate(
      { offer: offer._id, candidate: candidate._id },
      { status, comment },
      { upsert: true, new: true }
    );
    

    // Send the notification to the candidate
  const message = status === "Accepted"
  ? `Congratulations! Your application for the "${offer.titre}" position has been accepted.`
  : ` We're sorry, your application for the "${offer.titre}" position has been rejected.`;
 
  
    await Notification.create({
      message,
      recipient: candidate._id,
   comment
    
       
    });

    // Return success response
    res.status(200).json({ message: "Status updated & notification sent", result });

  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
};
exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({ recipient: userId, read: false });
    res.status(200).json({ count });
  } catch (error) {
    console.error("❌ Error getting unread count:", error.message);
    res.status(500).json({ error: error.message });
  }
};
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("🔍 Fetching notifications for user:", userId);

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate('recipient', 'username email',
     

       );

    console.log("📦 Notifications found:", notifications.length);

    res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ Error fetching notifications:", error.message);
    res.status(500).json({ error: error.message });
  }
};


exports.getAllNotifications = async (req, res) => {
  try {
    // If you're an admin/recruiter, you can see all notifications
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 }) // Most recent first
      .populate('recipient', 'username email',
   

       );
   // Optional: populate user info for better clarity

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
