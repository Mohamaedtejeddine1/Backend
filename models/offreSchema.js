const mongoose = require('mongoose');

const offreSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: false },
  competance: { type: String, required: false },
  domaine: { type: String, required: true },
  departement: { type: String, required: false  },
  status: { type: String, enum: ["open", "close"], default: "open" },
  recrut: { type: mongoose.Schema.ObjectId, ref: "User" } ,
  candidats: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      username: String,
      email:String,
      experiences: [{ type: String, }],
      competance: [{ type: String }],
      telephone:String,
      currentPosition:String,
   
      cvLink: String,
      appliedAt: { type: Date, default: Date.now },
      cvAnalysis: {
        matchedSkills: [String],
        missingSkills: [String],
        score: String,
        isCompatible: Boolean,
        reasoning: String,
        summary: String,}
      }

      
  ],  
  
  
});

const Offre = mongoose.model('Offre', offreSchema);

module.exports = Offre;
