const express = require("express");
const { createOffre, getAllOffres, getOffreById, updateOffre, deleteOffre,getOffresByRecruteur } = require("../controllers/offreController");
const offreController= require("../controllers/offreController");
const { requireAuthUser } = require("../middlewares/authMiddleware"); // Import the middleware

const router = express.Router();


router.post("/createOffre",requireAuthUser, createOffre); 
router.get("/getAllOffres", getAllOffres); 
router.get("/getOffreById/:id", getOffreById); 
router.put("/updateOffre/:id", updateOffre); 
router.delete("/deleteOffre/:id", deleteOffre); 
router.get("/getOffresByRecruteur", requireAuthUser,offreController.getOffresByRecruteur);

router.put('/updateCandidateStatus/:offreId/:candidateId', offreController.updateCandidateStatus);

router.get('/getApplicationsOverTime/', offreController.getApplicationsOverTime);
module.exports = router;
