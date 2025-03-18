// models/Offre.js
const mongoose = require('mongoose');

const offreSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  comptetance: { type: String, required: true },
  domaine: { type: String, required: true },
  departement: { type: String, required: true },
 
});

const Offre = mongoose.model('Offre', offreSchema);

module.exports = Offre;
