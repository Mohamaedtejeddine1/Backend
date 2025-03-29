const express = require("express");
const router = express.Router();

const { requireAuthUser}=require("../middlewares/authMiddleware");
const userController= require("../controllers/userController");

router.post("/register",userController.register);
router.post("/login",userController.login);
router.post("/logout", userController.logout);
router.post("/createUser", userController.createUser);
router.get("/getAllUsers",/* requireAuthUser*/userController.getAllUsers);
 router.get("/getUserById/:id", userController.getUserById);
 router.put("/updateUserById/:id",userController.updateUserById);
router.delete("/deleteUserById/:id", userController.deleteUserById);

module.exports = router;