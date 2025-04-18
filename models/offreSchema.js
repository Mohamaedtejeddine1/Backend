const mongoose = require('mongoose');

const offreSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  competance: { type: String, required: true },
  domaine: { type: String, required: true },
  departement: { type: String, required: true },
  status: { type: String, enum: ["open", "close"], default: "open" },
  recrut: { type: mongoose.Schema.ObjectId, ref: "User" } ,
  candidats: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      username: String,
      experiences:[{}],
      competance:[{}],


      appliedAt: { type: Date, default: Date.now },
    },
  ],
  
  
});

const Offre = mongoose.model('Offre', offreSchema);

module.exports = Offre;
