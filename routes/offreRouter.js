const express = require("express");
const { createOffre, getAllOffres, getOffreById, updateOffre, deleteOffre } = require("../controllers/offreController");
const { requireAuthUser } = require("../middlewares/authMiddleware"); // Import the middleware

const router = express.Router();


router.post("/createOffre", requireAuthUser, createOffre); 
router.get("/getAllOffres",requireAuthUser, getAllOffres); 
router.get("/getOffreById/:id",requireAuthUser, getOffreById); 
router.put("/updateOffre/:id", requireAuthUser, updateOffre); 
router.delete("/deleteOffre/:id", requireAuthUser, deleteOffre); 

module.exports = router;
