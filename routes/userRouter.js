const express = require("express");
const router = express.Router();

const { requireAuthUser}=require("../middlewares/authMiddleware")
const userController = require("../controllers/userController");
const recruteurController = require("../controllers/recruteurController");

router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/createCandidat", userController.createCandidat);
router.get("/getAllCandidat", requireAuthUser, userController.getAllCandidat);
router.get("/getCandidatById/:id", userController.getCandidatById);
router.put("/updateCandidatById/:id",userController.updateCandidatById);
router.delete("/deleteCandidat/:id", userController.deleteCandidat);


router.post("/createRecruteur", recruteurController.createRecruteur);
/*router.get("/getAllRecruteurs", recruteurController.getAllRecruteurs);
router.get("/getRecruteurById/:id", recruteurController.getRecruteurById);
/*router.put("/recruteur/:id", recruteurController.updateRecruteur);
router.delete("/recruteur/:id", recruteurController.deleteRecruteur);*/

module.exports = router;
