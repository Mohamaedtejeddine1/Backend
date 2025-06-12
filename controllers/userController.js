const mongoose = require('mongoose'); // Add this line at the very top
const userModel = require("../models/userSchema");
const authMiddleware = require("../middlewares/authMiddleware")
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Offre = require("../models/offreSchema");
const cloudinary = require("../utils/cloudinary");
const bcrypt = require("bcrypt");
const maxTime = 24 * 60 * 60 //24H
//const maxTime = 1 * 60 //1min
const createToken = (id) => {
  return jwt.sign({ id }, 'net secret pfe', { expiresIn: maxTime })
}

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role, profil, offre, cv, lettreMotivation, experiences, competance } = req.body;

    if (role !== "candidat" && role !== "recruteur" && role !== "admin") {
      return res.status(400).json({ message: "Role must be 'candidat' or 'recruteur' or 'admin" });
    }

    const user = await userModel.create({
      username,
      email,
      password,
      role,


      //     profil,

      //     cv,
      //     lettreMotivation,
      //     experiences,
      //     competance
      // 
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};


exports.updateCandidatDetails = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role !== "candidat") {
      return res.status(403).json({ error: "Operation only allowed for 'candidat' role" });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      {
        $set: {
          cv: updates.cv,
          competance: updates.competance,
          experiences: updates.experiences,
        },
      },
      { new: true, runValidators: true } // Ensure only updated fields are validated
    );

    res.status(200).json({
      message: " updated successfully",
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Backend (Express.js) Route to Get User Data
exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching user profile', error });
  }
};


// Get all users
module.exports.getAllUsers = async (req, res) => {
  try {
     const userListe = await userModel.find({ role: { $ne: "admin" } });
     res.status(200).json({ userListe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User
exports.updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userModel.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.updateProfilImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { filename } = req.file;

    if (!filename) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { profilImage: filename },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile image updated successfully',
      profilImage: updatedUser.profilImage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete User
exports.deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await userModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register User
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await userModel.create({ username, email, password, role });
    const token = createToken(user._id);
    res.cookie("jwt_token_9antra", token, { httpOnly: false, maxAge: maxTime * 1000 });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.login(email, password);
    const token = createToken(user._id);
    user.loginCount = (user.loginCount || 0) + 1;
    user.isOnline = true;
    user.lastLogin = new Date(),
      await user.save();
    res.cookie("jwt_token_9antra", token, {
      httpOnly: true,
      maxAge: maxTime * 1000
    });
    if (user.emailVerified === false) {
      return res.status(400).json({ message: "Please verify your email address" });
    }
    else{
      return res.status(200).json({user,token});
    }
    res.status(200).json({ user, token });
  } catch (error) {
    // Handle any errors by sending a 500 response
    res.status(500).json({ message: error.message });
  }
};
exports.getUsersStats = async (req, res) => {
  try {
    const users = await userModel.find({}, "username email role loginCount isOnline lastLogin"); // only select needed fields
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
async function countUsersByRole() {
  const candidatCount = await userModel.countDocuments({ role: "candidat" });
  const recruteurCount = await userModel.countDocuments({ role: "recruteur" });

  return { candidatCount, recruteurCount };
}

// Add a controller to handle the route request
module.exports.getCounts = async (req, res) => {
  try {
    const counts = await countUsersByRole();
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;

    if (userId) {
      await userModel.findByIdAndUpdate(userId, { isOnline: false });
    }

    res.status(200).json({ message: "User logged out and set offline" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCandidatDetails = async (req, res) => {
  try {

    let updateData = {
      competance: req.body.competance,
      experiences: req.body.experiences,



    };

    if (req.body.cv) {
      updateData.cv = req.body.cv;
    }


    await userModel.findByIdAndUpdate(req.params.id, updateData);
    res.status(200).json({ success: true, message: "Details updated successfully!", updateData });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateProfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, competance, experiences, location, telephone, offres,company,poste, cvLink } = req.body;

    const updatedCandidat = await userModel.findByIdAndUpdate(
      id,
      {
        username,
        email,
        competance,
        experiences,
        location,
        telephone,
        offres,
        cvLink, 
        company,
        poste,// Store the Cloudinary URL here
      },
      { new: true } // Return the updated document
    );

    // If candidate not found
    if (!updatedCandidat) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Send response back with the updated candidate details
    return res.status(200).json({
      message: 'Profile updated successfully',
      updatedCandidat,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating profile', error });
  }
};


exports.postuler = async (req, res) => {
  try {
    let { userId, offreId } = req.body;


    userId = userId.trim();
    offreId = offreId.trim();

    const user = await userModel.findById(userId);
    const offre = await Offre.findById(offreId);

    if (!user || !offre) {
      return res.status(404).json({ message: "User or Offer not found" });
    }

    if (!user.offres.includes(offre._id)) {
      user.offres.push(offre);
      user.offres.push(offre._id);

    }

    if (!offre.candidats.includes(user._id)) {
      offre.candidats.push(user);


    }

    await user.save({ validateBeforeSave: false });
    await offre.save();

    res.status(200).json({ message: "Application successful", user, offre });
  } catch (err) {
    console.error("Postuler error:", err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

const nodemailer = require('nodemailer');
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const genAI = new GoogleGenerativeAI("AIzaSyAoalxptPiU4lEEKmfZbJhHEH4M6jruQnA");


// Email setup
const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'meknitej2003@gmail.com',
      pass: 'rwcystwdblflibvu',
    },
  });

  const mailOptions = {
    from: 'meknitej2003@gmail.com', // sender address
    to: to, // recipient email address
    subject: subject,  // Subject line
    text: text,  // plain text body
    html: html,  // HTML body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

exports.postulerA = async (req, res) => {
  try {
    const { username, competance, experiences, telephone,linkedin, location, education } = req.body;
    const { userId, offreId } = req.params;

    const user = await userModel.findById(userId);
    const offre = await Offre.findById(offreId);

    if (!user || !offre) {
      return res.status(404).json({ message: "User or Offer not found" });
    }
   if (offre.status === "closed") {
  return res.status(400).json({
    message: "Unable to apply: the offer is no longer available.",
  });
}
    
    // Handle CV upload path
    let cvUrl = null;
    if (req.file && req.file.path) {
      cvUrl = req.file.path;
    }

    const updateData = {
      username,
      education,
      competance,
      experiences,
      telephone,
      linkedin,
      location,
   
    };

    if (cvUrl) {
      updateData.cvLink = cvUrl;
    }

    // Update user profile
    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true });

    // Avoid duplicate entries in user.offres
    if (!user.offres.some(o => o.id?.toString() === offre._id.toString())) {
      user.offres.push({ id: offre._id, titre: offre.titre });
    }

    // Check if already applied
    const alreadyApplied = offre.candidats.find(c => c.user?.toString() === user._id.toString());

    if (!alreadyApplied) {
      offre.candidats.push({
        user: user._id,
        username,
        email: user.email,
        experiences,
        competance,
        telephone,
        location,
        education,
        cvLink: cvUrl,
        linkedin,
        cvAnalysis: null ,
    
      });
    }

    await user.save({ validateBeforeSave: false });
    await offre.save();

    // === Gemini CV Analysis ===
    let cvAnalysis = null;
    if (cvUrl && cvUrl.startsWith("http")) {
      const response = await axios.get(cvUrl, { responseType: "arraybuffer" });
      const pdfData = await pdfParse(response.data);
      const extractedText = pdfData.text;

      const requiredSkills = typeof offre.competance === "string"
        ? offre.competance.split(",").map(skill => skill.trim())
        : [];

      const skillsString = requiredSkills.join(", ");

      const prompt = `
You are a strict CV analysis assistant focused on rigorously matching the CV content to the required skills.
Compare the skills listed in the CV with the required skills and calculate a score based on the following formula:

Score = (Number of Matched Skills / Total Required Skills) * 100

Return only a JSON object:
{
  "matchedSkills": [...],
  "missingSkills": [...],
  "score": "X/100",
  "isCompatible": true/false,
  "reasoning": "Brief explanation.",
  "summary": "2-3 sentence summary."
}

CV Content:
${extractedText}

Required Skills:
${skillsString}
`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      let text = await result.response.text();

      console.log("Gemini raw output:", text);

      try {
        cvAnalysis = JSON.parse(text.trim());
      } catch (e) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) cvAnalysis = JSON.parse(match[0]);
        else cvAnalysis = { error: "Could not parse Gemini output" };
      }

      // Save cvAnalysis to candidat
      const index = offre.candidats.findIndex(c => c.user.toString() === user._id.toString());
      if (index !== -1) {
        offre.candidats[index].cvAnalysis = cvAnalysis;
        await offre.save();
      }
    }

    // === Send confirmation email ===
    const subject = `Application Received for ${offre.titre}`;
    const text = `Dear ${user.username},

Thank you for applying for the position of ${offre.titre}.
We will review your application and get back to you soon.`;

    const html = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f7fc; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
          <h2 style="color: #4A90E2;">Application Received</h2>
          <p>Dear <strong>${user.username}</strong>,</p>
          <p>Thank you for applying for the position of <strong>${offre.titre}</strong>.</p>
          <p>We will review your application and get back to you soon.</p>
          <p>Best regards,<br/>The Recruitment Team</p>
        </div>
      </body>
    </html>
    `;

    await sendEmail(user.email, subject, text, html);

    res.status(200).json({
      message: "Application submitted and analyzed successfully",
      userUpdate: updateData,
      cvAnalysis,
      cvLink: cvUrl,
    });
  } catch (err) {
    console.error("PostulerA Error:", err);
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};


const crypto = require('crypto');
const { error } = require('console');



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "meknitej2003@gmail.com",
    pass: "rwcystwdblflibvu"
  }
});

module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Find user (don't select password to avoid validation)
    const user = await userModel.findOne({ email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Generate token (no password modification)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // 3. Update ONLY the token fields (avoid touching password)
    await userModel.updateOne(
      { _id: user._id },
      {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      }
    );

    // 4. Send email
    const resetUrl = `http://localhost:3000/ResetPassword?token=${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2e2e2e; background-color: #f9f9f9; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 30px;">
          <h2 style="color: #1e90ff; text-align: center;">Reset Your Password</h2>
          <p>Hi there,</p>
          <p>We received a request to reset the password for your account. For your security, this link is valid for the next 60 minutes.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #1e90ff; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>If the button above doesn't work, paste this URL into your web browser:</p>
          <p style="word-break: break-word;"><a href="${resetUrl}" style="color: #1e90ff;">${resetUrl}</a></p>
          <hr style="margin: 40px 0;" />
          <p style="font-size: 14px; color: #6b7280;">
            If you did not request this password reset, please ignore this message or contact support if you have concerns.
          </p>
          
          <p style="font-size: 14px; color: #6b7280;">
            Thank you,<br/>
            <strong>RH Platfrom Team </strong>
          </p>
        </div>
      </div>
    `



    });

    res.status(200).json({ message: 'Reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;        // 1. Get the reset token from the URL
    const { newPassword } = req.body;    // 2. Get the new password from the request body

    // 3. Find user by reset token and check if it's not expired
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    // 4. If no user found or token expired
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 5. Remove offres if they are not needed
    user.offres = undefined; // clear offres field if not required for reset password

    // 6. Set new password and clear the reset token and expiry
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // 7. Save the user (this triggers validation + password hashing)
    await user.save();

    // 8. Send confirmation email
    await transporter.sendMail({
      to: user.email,
      subject: "🔐 Password Changed Successfully",
      text: "Your password has been updated.",
      html: `
    <div style="max-width: 600px; margin: auto; padding: 30px; background: #ffffff; border-radius: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #2c3e50;">✅ Password Changed Successfully</h2>
      <p style="font-size: 16px; color: #444;">Hello,</p>
      <p style="font-size: 15px; color: #555;">We're letting you know that your password was successfully updated.</p>
      <p style="font-size: 15px; color: #555;">If this wasn't you, please contact our support team immediately to secure your account.</p>
      <p style="margin-top: 40px; font-size: 13px; color: #999;">If you made this change, no further action is needed.</p>
      <p style="font-size: 13px; color: #999;">– RH Platfrom Team</p>
    </div>
  `
    });


    // 9. Return success
    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {

    if (error.name === "ValidationError") {
      const passwordError =
        error.errors && error.errors.password
          ? error.errors.password.message
          : "Password validation failed";
      return res.status(400).json({ message: passwordError });
    }

    console.error("Reset password error:", error);

    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};



// Register function to handle user registration and email verification token creation
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        details: {
          emailExists: existingUser.email === email,
          usernameExists: existingUser.username === username
        }
      });
    }

    // Create user
    const user = await userModel.create({ username, email, password, role });

    // Generate email verification token (1 hour expiration)
    const emailVerificationToken = jwt.sign(
      { userId: user._id },
      'net-secret-pfe', // Stronger secret key
      { expiresIn: '1h' }
    );

    // Save token and expiry to the user
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create verification URL
    const verificationUrl = `http://localhost:3000/VerifyEmailPage?token=${encodeURIComponent(emailVerificationToken)}`;

    // For Postman testing, include the URL in the response
    const response = {
      message: 'Registration successful - verify your email',
      verificationInfo: {
        note: 'For Postman testing - use this URL to verify',
        verificationUrl: verificationUrl,
        token: emailVerificationToken // Including token directly for easy testing
      },
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified
      }
    };

    // In a real app, you would send the email:
    await transporter.sendMail({
      to: user.email,
      subject: 'Email Verification',
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2e2e2e; background-color: #f9f9f9; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 30px;">
          <h2 style="color: #1e90ff; text-align: center;">Verify Your Email Address</h2>
          <p>Hello,</p>   
          <p>Thank you for registering with RH Platforme . To complete your registration, please verify your email address by clicking the link below:</p>
          
          <p style="text-align: center;">
            <a href="${verificationUrl}" style="background-color: #1e90ff; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Verify Email</a>
          </p>
          
          <p>If you did not create an account, you can safely ignore this email.</p>
          
          <hr style="margin: 40px 0;" />
          
          <p style="font-size: 14px; color: #6b7280;">
            Best regards,<br />
            The  RH Platforme Team
          </p>
        </div>
      </div>
    `
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Verify email function to validate the token and verify the user's email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query; // Extract the token from the URL query parameters

    // Log the token for debugging purposes
    console.log('Received token:', token);

    // Find the user by the token and check expiry
    const user = await userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() } // Ensure token is not expired
    });

    // If user is not found or token is expired
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // If valid, set the emailVerified flag to true and clear the token fields
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    // Log the successful verification
    console.log('Email verified successfully for user:', user.username);

    res.status(200).json({ message: "Email verified successfully" });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: error.message });
  }
};



async function extractSummaryFromCloudinary(cvUrl) {
  try {
    // Download PDF data from Cloudinary
    const response = await axios.get(cvUrl, { responseType: 'arraybuffer' });
    const pdfBuffer = response.data;

    // Extract text from PDF buffer
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text.trim();

    // Simple summary — first 500 chars
    const summary = text.length > 500 ? text.slice(0, 500) + '...' : text;

    return summary;
  } catch (error) {
    console.error('Error extracting summary from Cloudinary CV:', error);
    return null;
  }
}
