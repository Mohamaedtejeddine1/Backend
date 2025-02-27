const userModel = require("../models/userSchema");

// Create Recruteur
exports.createRecruteur = async (req, res) => {
  try {
    const { username, email, password, role, profil, offre } = req.body;

    // Ensure the role is 'recruteur'
    if (role !== "recruteur") {
      return res.status(400).json({ message: "Role must be 'recruteur'" });
    }

    // Create the recruiter
    const user = await userModel.create({
      username,
      email,
      password,
      role,
      profil,
      offre,
      cv:null,lettreMotivation:null
    });

    res.status(201).json({ message: "Recruteur created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error creating recruteur", error: error.message });
  }
};

// Read All Recruteurs
exports.getAllRecruteurs = async (req, res) => {
  try {
    const list = await userModel.find({ role: "recruteur" });
    res.status(200).json({ list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read Recruteur by ID
exports.getRecruteurById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user || user.role !== "recruteur") {
      return res.status(404).json({ message: "Recruteur not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Recruteur by ID
exports.updateRecruteurById = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, username, password, profil, offre } = req.body;

    // Update the recruiter
    await userModel.findByIdAndUpdate(
      id,
      {
        $set: { username, email, password, profil, offre },
      },
      { new: true }
    );

    const updated = await userModel.findById(id);

    if (!updated || updated.role !== "recruteur") {
      return res.status(404).json({ message: "Recruteur not found" });
    }

    res.status(200).json({ updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Recruteur
exports.deleteRecruteur = async (req, res) => {
  try {
    const { id } = req.params;
    const recruteur = await userModel.findByIdAndDelete(id);

    if (!recruteur || recruteur.role !== "recruteur") {
      return res.status(404).json({ message: "Recruteur not found" });
    }

    res.status(200).json({ message: "Recruteur deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting recruteur", error: error.message });
  }
};
