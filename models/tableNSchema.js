const mongoose = require("mongoose");
const tablenSchema = new mongoose.Schema(
  {
    model: String,
    matricule: String,
    prix : Number,
    owner : {type : mongoose.Schema.Types.ObjectId,ref: 'User'} // many to one 
    //owners : [{type : mongoose.Schema.Types.ObjectId,ref: 'User'}] // many to one
    
},
  { timestamps: true }
);

const Tablen = mongoose.model("Tablen", carSchema);
module.exports = Tablen;
