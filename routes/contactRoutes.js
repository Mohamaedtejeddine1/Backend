const express = require('express');
const router = express.Router();
const contactController=require('../controllers/contactController')

router.post('/sendMessage', contactController.sendMessage);
router.get('/getAllMessage', contactController.getAllMessage);
router.delete('/deleteMessage/:id', contactController.deleteMessage);
module.exports = router;
