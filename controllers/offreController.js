const Offre = require("../models/offreSchema"); 


module.exports.createOffre = async (req, res) => {
    try {
        const {titre,description,comptetance,domaine,departement}=req.body;
        const offre=await Offre.create({titre,description,comptetance,domaine,departement})

        
        res.status(201).json(offre);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllOffres = async (req, res) => {
    try {
        const offres = await Offre.find();
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
