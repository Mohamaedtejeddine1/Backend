const mongoose = require('mongoose'); // Add this line at the very top
const userModel = require("../models/userSchema");
const authMiddleware=require("../middlewares/authMiddleware")
const jwt = require('jsonwebtoken');
const fs = require('fs'); 
const Offre=require("../models/offreSchema");
const cloudinary = require("../utils/cloudinary"); 
const bcrypt = require("bcrypt");
const maxTime = 24 *60 * 60 //24H
//const maxTime = 1 * 60 //1min
const createToken = (id) => {
    return jwt.sign({id},'net secret pfe', {expiresIn: maxTime })
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
module.exports.getAllUsers= async (req,res) => {
    try {
        const userListe = await userModel.find()
        res.status(200).json({userListe});
    } catch (error) {
        res.status(500).json({message: error.message});
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
module.exports.addUserClientWithImg = async (req,res) => {
    try {
        const {competance ,experiences  } = req.body;
        const roleClient = 'candidat'
        const {filename} = req.file

        const user = await userModel.create({
           competance ,experiences,role :roleClient , cv: filename
        })
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

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


module.exports.logout= async (req,res) => {
    try {
  
        res.cookie("jwt_token_9antra", "", {httpOnly:false,maxAge:1})
        res.status(200).json("logged")
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

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
      res.status(200).json({ success: true, message: "Details updated successfully!",updateData });
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };






  exports.updateProfil = async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, experiences, competance,currentPosition,telephone } = req.body;
  
      const updatedCandidat = await userModel.findByIdAndUpdate(
        id,
        {
          username,
          email,
          experiences,currentPosition,
          competance,telephone
        },
        { new: true }
      );
  
      if (!updatedCandidat) {
        return res.status(404).json({ message: 'Candidate not found' });
      }
  
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
      to: 'tejeddin.m@gmail.com',  // recipient email address
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
      const { username, email, competance, experiences, telephone, currentPosition } = req.body;
      const { userId, offreId } = req.params;
  
      const user = await userModel.findById(userId);
      const offre = await Offre.findById(offreId);
  
      if (!user || !offre) {
        return res.status(404).json({ message: "User or Offer not found" });
      }
  
      // Handle CV upload path
      let cvUrl = null;
      if (req.file && req.file.path) {
        cvUrl = req.file.path;
      }
  
      const updateData = {
        username,
        email,
        competance,
        experiences,
        telephone,
        currentPosition,
        cvLink: cvUrl,  // Ensure cvLink is included in the update data
      };
  
      // Update user with CV link if exists
      if (cvUrl) {
        updateData.cvLink = cvUrl;
      }
  
      // Update candidate profile
      const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true });
  
      // Link user to offer if not already linked
      if (!user.offres.includes(offre._id)) {
        user.offres.push(offre._id);
      }
  
      // Declare cvAnalysis once at the top
      let cvAnalysis = null;
  
      // Prevent duplicate candidacy
      const alreadyApplied = offre.candidats.find(c => c.user?.toString() === user._id.toString());
  
      if (!alreadyApplied) {
        offre.candidats.push({
          user: user._id,
          username,
          email,
          experiences,
          competance,
          telephone,
          currentPosition,
          cvLink: cvUrl,
          cvAnalysis: null // Will update after Gemini processing
        });
      }
  
      // Save the user and the offer with updated information
      await user.save({ validateBeforeSave: false });
      await offre.save();
  
      // ========== Gemini CV Analysis ==========
      if (cvUrl && cvUrl.startsWith("http")) {
        const response = await axios.get(cvUrl, { responseType: "arraybuffer" });
        const pdfData = await pdfParse(response.data);
        const extractedText = pdfData.text;
  
        const requiredSkills = typeof offre.competance === "string"
          ? offre.competance.split(",").map(skill => skill.trim())
          : [];
  
        const skillsString = requiredSkills.join(", ");
  
        const prompt = `
          You are a strict CV analysis assistant focused on matching the CV content to the required skills.
          Analyze the CV content below and compare it rigorously to these required skills: ${skillsString}.
  
          Scoring Guidelines:
          - 90-100: All required skills are explicitly mentioned and demonstrate strong, relevant experience.
          - 70-80: Most required skills are present with clear examples of their application.
          - 50-60: Approximately half of the required skills are identifiable, but the depth of experience might be limited.
          - Below 50: Few required skills are evident or the experience is not relevant.
  
          Return ONLY a JSON object with the following fields:
          {
            "matchedSkills": ["...", ...],
            "missingSkills": ["...", ...],
            "score": "X/100",
            "isCompatible": true/false,
            "reasoning": "Brief justification for the assigned score.",
            "summary": "2-3 sentence summary of the candidate's fit, highlighting strengths and weaknesses against the job requirements."
          }
  
          CV Content:
          ${extractedText}
  
          Only return the JSON object. No explanation.
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
  
        // Update cvAnalysis in offre.candidats array
        const candidateIndex = offre.candidats.findIndex(c => c.user.toString() === user._id.toString());
        if (candidateIndex !== -1) {
          offre.candidats[candidateIndex].cvAnalysis = cvAnalysis;
          await offre.save();
        }
      }
  
      // Send email to candidate after application
      const subject = `Application Received for ${offre.titre}`;
      const text = `Dear ${user.username},\n\nThank you for applying for the position of ${offre.titre}.\n\nWe will review your application and get back to you soon.`;
      const html = `<p>Dear <strong>${user.username}</strong>,</p><p>Thank you for applying for the position of <strong>${offre.titre}</strong>.</p><p>We will review your application and get back to you soon.</p>`;
      
      // Send email to candidate
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
      subject: "Password Changed Successfully",
      text: "Your password has been updated.",
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