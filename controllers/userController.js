
const userModel = require("../models/userSchema");
const authMiddleware=require("../middlewares/authMiddleware")
const jwt = require('jsonwebtoken');
const cloudinary = require('../utils/cloudinary').v2; 
const fs = require('fs'); 

const maxTime = 24 *60 * 60 //24H
//const maxTime = 1 * 60 //1min
const createToken = (id) => {
    return jwt.sign({id},'net secret pfe', {expiresIn: maxTime })
}
// Create User (Candidat or Recruteur)
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
  
      res.status(200).json({ success: true, message: "Details updated successfully!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  exports.updateProfil = async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, experiences, competance } = req.body;
  
      // Update profile details
      const updatedCandidat = await userModel.findByIdAndUpdate(
        id,
        {
          username,
          email,
          experiences,   // Changed to plural as per the request
          competance,    // Corrected spelling for "competence"
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
  
  
exports.postulerOffre = async (req, res) => {
    try {
      const { userId, offreId } = req.body;
  
      // Vérifier si l'offre existe
      const offre = await Offre.findById(offreId);
      if (!offre) {
        return res.status(404).json({ message: "Offre introuvable" });
      }
  
      // Vérifier si le candidat existe
      const candidat = await User.findById(userId);
      if (!candidat) {
        return res.status(404).json({ message: "Candidat introuvable" });
      }
  
      // Vérifier si l'offre est déjà ajoutée
      const alreadyApplied = candidat.offres.some(
        (item) => item.offreId.toString() === offre._id.toString()
      );
  
      if (!alreadyApplied) {
        // Ajouter l'ID et le titre dans le tableau
        candidat.offres.push({
          offreId: offre._id,
          titre: offre.titre
        });
  
        await candidat.save();
      }
  
      // Mettre à jour le champ `candidat` dans l'offre si besoin
      offre.candidat = candidat._id;
      await offre.save();
  
      res.status(200).json({
        message: "Candidature enregistrée",
        user: candidat,
      });
  
    } catch (error) {
      console.error("Erreur postulation :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  };