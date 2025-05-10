const Offre = require("../models/offreSchema"); 
const userModel = require("../models/userSchema");


module.exports.createOffre = async (req, res) => {
    try {
      const { titre, competance, domaine } = req.body;
  
      // Create the offer with recruiter ID
      const offre = await Offre.create({
        titre,
        competance,
        domaine,
        recrut: req.user.id,  // assuming req.user is set by auth middleware
      });
  
      // Populate recruiter email before sending response
      const populatedOffre = await Offre.findById(offre._id).populate("recrut", "email");
  
      res.status(201).json(populatedOffre);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  

exports.getOffresByRecruteur = async (req, res) => {
    try {
        const object=req.user.email;
       const offres = await Offre.find({ recrut: req.user.id  });
        res.status(200).json(offres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};











exports.getAllOffres = async (req, res) => {
    try {
      const offres = await Offre.find().populate("recrut", "email"); // Include recruiter email
      res.status(200).json(offres);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

exports.getOffreById = async (req, res) => {
    try {
        const offre = await Offre.findById(req.params.id);
        if (!offre) {
            return res.status(404).json({ message: "Offre non trouvée" });
        }
        res.status(200).json(offre);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOffre = async (req, res) => {
    try {
        const offre = await Offre.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!offre) {
            return res.status(404).json({ message: "Offre non trouvée" });
        }
        res.status(200).json(offre);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.deleteOffre = async (req, res) => {
    try {
        const offre = await Offre.findByIdAndDelete(req.params.id);
        if (!offre) {
            return res.status(404).json({ message: "Offre non trouvée" });
        }
        res.status(200).json({ message: "Offre supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};