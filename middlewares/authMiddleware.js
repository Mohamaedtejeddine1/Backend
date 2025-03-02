const jwt = require("jsonwebtoken");
const userModel = require("../models/userSchema");

const requireAuthUser = (req, res, next) => {
   const token = req.cookies.jwt_token_9antra;

  //const authHeader = req.headers.authorization;
  //const token = authHeader && authHeader.split(" ")[1];
  // console.log("token", token);
  if (token) {
    jwt.verify(token, 'net secret pfe', async (err, decodedToken) => {
      if (err) {
        console.log("il ya une erreur au niveau du token", err.message);
         req.session.user = null;  //session null
        res.json("/Problem_token");
      } else {
        req.session.user== await userModel.findById(decodedToken.id); //session feha user
        next();
      }
    });
  } else {
   req.session.user = null; //session null
    res.json("/pas_de_token");
  }
};
module.exports = { requireAuthUser };