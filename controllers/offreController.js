const Offre = require("../models/offreSchema"); 
const userModel = require("../models/userSchema");


module.exports.createOffre = async (req, res) => {
    try {
      const { titre, competance, domaine ,description, status } = req.body;
  
      // Create the offer with recruiter ID
      const offre = await Offre.create({
        titre,
        competance,
        domaine,description,
        status,
        
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
};// Get daily application counts from all offres
exports.getApplicationsOverTime = async (req, res) => {
  try {
    const result = await Offre.aggregate([
      { $unwind: "$candidats" },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$candidats.appliedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(result);
  } catch (error) {
    console.error("Aggregation error:", error);
    res.status(500).json({ message: "Error fetching application stats" });
  }
};

exports.updateCandidateStatus=async (req, res) => {
  const { offreId, candidateId } = req.params;
  const { action } = req.query; // or req.body.action if you prefer

  if (!['accept', 'reject', 'interview'].includes(action)) {
    return res.status(400).json({ message: "Invalid action. Use 'accept', 'reject' or 'interview'." });
  }

  try {
    const offre = await Offre.findById(offreId);

    if (!offre) {
      return res.status(404).json({ message: 'Job offer not found' });
    }

    // Find candidate in the offer's candidats array
    const candidate = offre.candidats.find(c => c.user.toString() === candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found for this offer' });
    }

    // Update status on candidate application
    candidate.status = action; // Add a 'status' field to candidat schema if not existing

    await offre.save();

    return res.json({
      message: `Candidate ${action}ed successfully`,
      candidate,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

