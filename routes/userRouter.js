const express = require("express");
const offre=require('../models/offreSchema')
const router = express.Router();
const upload = require('../middlewares/uploadFile');
const { requireAuthUser}=require("../middlewares/authMiddleware");
const userController= require("../controllers/userController");
router.post("/register",userController.register);
router.get('/verify-email', userController.verifyEmail);
router.post("/login",userController.login);
router.post("/logout", userController.logout);
router.post("/createUser", userController.createUser);
// router.put('/updateUserProfile/:id',userController.updateUserProfile); 
router.get("/getAllUsers",/* requireAuthUser*/userController.getAllUsers);
router.get("/getUserById/:id", userController.getUserById);
router.put("/updateUserById/:id",userController.updateUserById);
router.delete("/deleteUserById/:id", userController.deleteUserById);
router.put('/updateCandidatDetails/:id', upload.single('cv'), userController.updateCandidatDetails);
router.put(
  "/updateProfil/:id",
  upload.single('cv'),
  userController.updateProfil
);
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

module.exports = router;