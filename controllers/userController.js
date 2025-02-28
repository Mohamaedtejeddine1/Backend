const userModel = require("../models/userSchema");
const jwt=require("jsonwebtoken");

//creation  Token et apple dans fonction login  || //const MaxAge=2*60*60//2 heures
const maxTime=1*60// 1min
const createToken=(id) => {
  return jwt.sign({id},"net secret pfe",{expiresIn:maxTime})

}


// Create Candidat
exports.createCandidat = async (req, res) => {
  try {
    const { username, email, password, role,  cv, lettreMotivation, experiences, competance } = req.body;
    if (role !== "candidat") {
      return res.status(400).json({ message: "Role must be 'candidat'" });
    }
    const user=await userModel.create({
        username,email,password,role,cv, lettreMotivation, experiences, competance
    })
  
    res.status(201).json({ message: "Candidat created successfully", user});
  } catch (error) {
    res.status(500).json({ message: "Error creating candidat", error: error.message });
  }
};

// Read Candidat
module.exports.getAllCandidat= async (req,res) => {
    try {

        const list= await userModel.find({role:"candidat"})

        res.status(200).json({list});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}
module.exports.getCandidatById= async (req,res) => {
    try {
        //const id = req.params.id
        const {id} = req.params
        // autre :console.log(req.params.id)
        const user = await userModel.findById(id)

        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

module.exports.updateCandidatById = async (req, res) => {
    try {
        const {id} = req.params
        const {email , username,password,cv,lettreMotivation,experiences,competance} = req.body;
    
        await userModel.findByIdAndUpdate(id,{$set :{ username, email, password, cv, lettreMotivation, experiences, competance },
        })
        const updated = await userModel.findById(id)
    
        res.status(200).json({updated})
    } catch (error) {
        res.status(500).json({message: error.message});
    }
    }
    


// Delete Candidat
exports.deleteCandidat = async (req, res) => {
  try {
    const id=req.params.id;
    const candidat = await userModel.findOneAndDelete(id);
    if (!candidat) {
      return res.status(404).json({ message: "Candidat not found" });
    }
    res.status(200).json({ message: "Candidat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting candidat", error: error.message });
  }
};
//consomation login
module.exports.login= async (req,res) => {
  try {
      const { email , password } = req.body;
      const user = await userModel.login(email, password)
      const token = createToken(user._id)
      res.cookie("jwt_token_9antra", token, {httpOnly:false,maxAge:maxTime * 1000})
      
      res.status(200).json({user})
  } catch (error) {
      res.status(500).json({message: error.message});
  }}
  module.exports.logout= async (req,res) => {
    try {
      
        res.cookie("jwt_token_9antra", "", {httpOnly:false,maxAge:1})
        res.status(200).json({ message: "Logged out successfully " });

    } catch (error) {
        res.status(500).json({message: error.message});
    }}