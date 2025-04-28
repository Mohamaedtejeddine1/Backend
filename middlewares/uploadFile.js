const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cvs",
    resource_type: "auto",
    allowed_formats: ["pdf", "doc", "docx"],
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    transformation: [{ fetch_format: "pdf" }], // Optional transformation
  },
  
})

const upload = multer({ storage });

module.exports = upload;
