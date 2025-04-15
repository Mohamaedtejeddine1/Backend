const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "ddw6maz77",
  api_key: "134571339474818",
  api_secret: "5QKcaFioY3A_mS3CI3zFVHa8VfM",
  

});
exports.cloudinaryUploadImage = async (fileToUpload) => {
    try {
      const data = await cloudinary.uploader.upload(fileToUpload, {
        resource_type: "auto",
      });
      return data;
    } catch (error) {
      console.log(error);
      throw new Error("Internal Server Error (cloudinary)");
    }
  };
  
// Cloudinary Remove Image
exports.cloudinaryRemoveImage = async (imagePublicId) => {
    try {
      const result = await cloudinary.uploader.destroy(imagePublicId);
      return result;
    } catch (error) {
      console.log(error);
      throw new Error("Internal Server Error (cloudinary)");
    }
  };
  
  
  
  

module.exports = cloudinary;
