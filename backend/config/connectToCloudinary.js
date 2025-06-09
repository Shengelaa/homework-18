require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


const upload = async (base64, folder = "uploads") => {
  return await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: "image",
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary delete result:", result);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
};

module.exports = { upload, deleteFromCloudinary };
