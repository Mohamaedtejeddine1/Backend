const express = require("express");
const router = express.Router();
const offreController = require("../controllers/offreController");
//const recruteurController = require('../controllers/recruteurController');


// routes for offre

router.post("/createOffre", offreController.createOffre);
router.get("/getAllOffres", offreController.getAllOffres);
router.get("/getAllOffres/:id", offreController.getAllOffres);
router.put("/updateOffre/:id", offreController.updateOffre);
router.delete("/deleteOffre/:id", offreController.deleteOffre);

// routes postjob  wath7a






module.exports = router;


module.exports = router;
