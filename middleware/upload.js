

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Photos storage - images work fine
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crm/photos",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

// Docs - upload as image with pdf format so publicly accessible
const docStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crm/docs",
    resource_type: "image",
    allowed_formats: ["pdf"],
    format: "pdf",
  },
});

const imageUpload = multer({ storage: imageStorage, limits: { fileSize: 4 * 1024 * 1024 } });
const docUpload = multer({ storage: docStorage, limits: { fileSize: 4 * 1024 * 1024 } });

module.exports = { imageUpload, docUpload };
