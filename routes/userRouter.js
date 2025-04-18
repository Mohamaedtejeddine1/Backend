const express = require("express");
const router = express.Router();
const upload = require('../middlewares/uploadFile');
const { requireAuthUser}=require("../middlewares/authMiddleware");

const userController= require("../controllers/userController");

router.post("/register",userController.register);
router.post("/login",userController.login);
router.post("/logout", userController.logout);
router.post("/createUser", userController.createUser);
// router.put('/updateUserProfile/:id',userController.updateUserProfile); 
router.get("/getAllUsers",/* requireAuthUser*/userController.getAllUsers);
 router.get("/getUserById/:id", userController.getUserById);
 router.put("/updateUserById/:id",userController.updateUserById);
router.delete("/deleteUserById/:id", userController.deleteUserById);
router.put('/updateCandidatDetails/:id', upload.single('cv'), userController.updateCandidatDetails);

  router.put(
    "/updateProfil/:id", 
  

    userController.updateProfil
  );
  
  router.post("/postuler", userController.postuler);    


module.exports = router;


