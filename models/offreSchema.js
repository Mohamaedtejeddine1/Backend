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
      experiences:[{}],
      competance:[{}],
      telephone:String,
      currentPosition:String,
      Motivationletter:String,
      cvLink: String,
      appliedAt: { type: Date, default: Date.now },
    },
  ],
  
  
});

const Offre = mongoose.model('Offre', offreSchema);

module.exports = Offre;
