const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Photos - images only
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crm/photos",
    resource_type: "image",
  },
});

// Docs - all files as raw
const docStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crm/docs",
    resource_type: "raw",
  },
});

const imageUpload = multer({ 
  storage: imageStorage, 
  limits: { fileSize: 4 * 1024 * 1024 },
});

const docUpload = multer({ 
  storage: docStorage, 
  limits: { fileSize: 4 * 1024 * 1024 },
});

module.exports = { imageUpload, docUpload };
