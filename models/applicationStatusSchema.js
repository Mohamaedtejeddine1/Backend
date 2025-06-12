const mongoose = require("mongoose");

const applicationStatusSchema = new mongoose.Schema({
  offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offre", required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending"
  }, 
  
  comment: { type: String,required: true  }, 
}, { timestamps: true });

module.exports = mongoose.model("ApplicationStatus", applicationStatusSchema);
