const mongoose = require('mongoose');
const interviewSchema = new mongoose.Schema({
  offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offre", required: true,
     titre: { type: String, required: true },
   },

    recrut: { type: mongoose.Schema.ObjectId, ref: "User" } ,
    candidate: { type: mongoose.Schema.ObjectId, ref: "User" ,
      username:String,
      

    } ,

  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ["Planifié", "Confirmé", "Terminé", "Annulé"], default: "Planifié" },
  comments: { type: String, default: "" },
  meetLink: { type: String, default: "" },
  email: { type: String, required: true, trim: true, lowercase: true }, // candidate email only
}, { timestamps: true });


const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
