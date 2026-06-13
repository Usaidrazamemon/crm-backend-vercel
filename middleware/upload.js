
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Photos storage - images
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crm/photos",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

// Docs storage - PDF as image (publicly accessible)
const docStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    return {
      folder: "crm/docs",
      resource_type: "image",
      format: ext === "pdf" ? "pdf" : ext,
      allowed_formats: ["pdf", "jpg", "jpeg", "png"],
      public_id: `doc_${Date.now()}`,
    };
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
