const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    transformation: [{ fetch_format: "pdf" }],
    access_mode: "public", 
    tags: "public_cv" ,
     folder: "cvs",
    resource_type: "auto", 
    allowed_formats: ["pdf", "doc", "docx"], 
    use_filename: true, 
    unique_filename: true, 
    overwrite: false, 
    type: "upload", 
    sign_url: false, 
    invalidate: true, 
  },
  
});
const upload = multer({ storage });

module.exports = upload;
