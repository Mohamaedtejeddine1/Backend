const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/InterviewController");
const { requireAuthUser } = require("../middlewares/authMiddleware"); // Import the middleware


router.post("/createInterview", requireAuthUser,interviewController.createInterview);
router.get('/getInterviewsByRecruiter', requireAuthUser, interviewController.getInterviewsByRecruiter);

// Get all interviews
router.get("/getAllInterviews", interviewController.getAllInterviews);

// Get interview by ID
router.get("/:id",requireAuthUser, interviewController.getInterviewById);

router.get("/user/:userId", interviewController.getInterviewsByUser);

router.get('/byRecruiter/:recruiterId', interviewController.getInterviewsByRecruiter);
router.get("/offer/:offerId", interviewController.getInterviewsByOffer);

// Update interview
router.put("/:id", interviewController.updateInterview);

// Delete interview
router.delete("/:id", interviewController.deleteInterview);


module.exports = router;
