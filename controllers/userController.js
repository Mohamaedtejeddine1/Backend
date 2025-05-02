const mongoose = require('mongoose'); // Add this line at the very top
const userModel = require("../models/userSchema");
const authMiddleware=require("../middlewares/authMiddleware")
const jwt = require('jsonwebtoken');
const fs = require('fs'); 
const Offre=require("../models/offreSchema");
const cloudinary = require("../utils/cloudinary"); 


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

module.exports.login= async (req,res) => {
    try {
        const { email , password } = req.body;
        const user = await userModel.login(email, password)
        const token = createToken(user._id)
        res.cookie("jwt_token_9antra", token, {httpOnly:false,maxAge:maxTime * 1000})
        res.status(200).json({user,token})

    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

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
  

  const pdfParse = require("pdf-parse");
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const axios = require("axios");
// Ensure correct path
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
  
  exports.postulerA = async (req, res) => {
    try {
      const { username, email, competance, experiences, telephone, currentPosition } = req.body;
      const { userId, offreId } = req.params;
  
      const user = await userModel.findById(userId);
      const offre = await Offre.findById(offreId);
  
      if (!user || !offre) {
        return res.status(404).json({ message: "User or Offer not found" });
      }
  
      // Handle CV URL
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
      };
  
      if (cvUrl) {
        updateData.cvLink = cvUrl;
      }
  
      // Update user profile
      await userModel.findByIdAndUpdate(userId, updateData, { new: true });
  
      // Associate user with offer
      if (!user.offres.includes(offre._id)) {
        // user.offres.push(offre._id);
        user.offres.push(offre.titre);
        

      }
    
  
      if (!offre.candidats.find(c => c.user?.toString() === user._id.toString())) {
        offre.candidats.push({
          user: user._id,
          username,
          email,
          experiences,
          competance,
          telephone,
          currentPosition,
          cvLink: cvUrl,
        });
      }
  
      await user.save({ validateBeforeSave: false });
      await offre.save();
  
      // ========== Gemini CV Analysis ==========
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
  You are a strict CV analysis assistant focused on matching the CV content to the required skills.
  Analyze the CV content below and compare it rigorously to these required skills: ${offre.competance}.
  
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
  
  Only return the JSON object. No explanation.p
        `;
       
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
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
      }
  
      res.status(200).json({
        message: "Application submitted and analyzed successfully",
        userUpdate: updateData,
        cvAnalysis,
      });
  
    } catch (err) {
      console.error("PostulerA Error:", err);
      res.status(500).json({
        message: "Something went wrong",
        error: err.message,
      });
    }
  };
  