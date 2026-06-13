

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Photos storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crm/photos",
    resource_type: "image",
    upload_preset: "ml_default",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

// Docs storage
const docStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crm/docs",
    resource_type: "raw",
    upload_preset: "ml_default",
    public_id: undefined,
  },
});

const imageUpload = multer({ storage: imageStorage, limits: { fileSize: 4 * 1024 * 1024 } });
const docUpload = multer({ storage: docStorage, limits: { fileSize: 4 * 1024 * 1024 } });

module.exports = { imageUpload, docUpload };
