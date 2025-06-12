const express = require("express");
const offre=require('../models/offreSchema')
const router = express.Router();
const upload = require('../middlewares/uploadFile');

const { requireAuthUser}=require("../middlewares/authMiddleware");
const userController= require("../controllers/userController");
const uploadd = require('../middlewares/localUpload');

router.post("/register",userController.register);
router.get('/verify-email', userController.verifyEmail);
router.post("/login",userController.login);
router.post("/logout",requireAuthUser, userController.logout);
router.post("/createUser", userController.createUser);
router.put('/updateProfilImage/:id', uploadd.single('profilImage'), userController.updateProfilImage);
// router.put('/updateUserProfile/:id',userController.updateUserProfile); 
router.get("/getAllUsers",/* requireAuthUser*/userController.getAllUsers);
router.get("/getUserById/:id", userController.getUserById);
router.put("/updateUserById/:id",userController.updateUserById);
router.delete("/deleteUserById/:id", userController.deleteUserById);
router.put('/updateCandidatDetails/:id', upload.single('cv'), userController.updateCandidatDetails);
router.put(
  "/updateProfil/:id",
  upload.single('profileImage'),
  userController.updateProfil
);
router.get('/getCounts', userController.getCounts);
router.get(
  "/getUserProfile/:id",
 
  userController.getUserProfile
); 

  router.post(
    "/postulerA/:userId/:offreId",
    upload.single("cv"), 
    userController.postulerA
  );
  router.post('/forgot-password', userController.forgotPassword);
  router.post("/resetpassword/:token", userController.resetPassword);
  router.get("/getUsersStats", userController.getUsersStats);






  
const sendEmail = require('../utils/mailer');  // Import the sendEmail function
router.post('/apply', (req, res) => {
  const { candidateEmail, titre, candidateName } = req.body;

  // Confirmation email to the candidate
  const subject = `Application Confirmation for ${titre}`;
  const text = `Hello ${user.username},\n\nThank you for applying for the position of ${titre}. We are currently reviewing your application and will get back to you shortly.\n\nBest regards,\nThe Recruitment Team`;
  const html = `
    <p>Hello <strong>${candidateName}</strong>,</p>
    <p>Thank you for applying for the position of <strong>${titre}</strong>. We are currently reviewing your application and will get back to you shortly.</p>
    <p>Best regards,<br>The Recruitment Team</p>
  `;

  // Send the email to the candidate
  sendEmail(candidateEmail, subject, text, html);

  // Respond back to the client (candidate)
  res.send('Application submitted successfully');
});
const axios = require("axios");
const pdfParse = require("pdf-parse");

router.post("/extractSummaryFromCloudinary", async (req, res) => {
  try {
    const { cvUrl } = req.body;

    if (!cvUrl) {
      return res.status(400).json({ message: "cvUrl is required in the request body" });
    }

    // Download PDF from Cloudinary URL
    const response = await axios.get(cvUrl, { responseType: "arraybuffer" });
    const pdfBuffer = response.data;

    // Extract text from PDF buffer
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text.trim();

    // Simple summary (first 500 chars)
    const summary = text.length > 500 ? text.slice(0, 500) + "..." : text;

    // Return summary
    res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error("Error extracting summary:", error);
    res.status(500).json({ message: "Failed to extract CV summary" });
  }
});




module.exports = router;