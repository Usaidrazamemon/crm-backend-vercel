


const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Photos - image only
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crm/photos",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

// Docs - raw (pdf, doc, docx, txt)
const docStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "crm/docs",
    resource_type: "raw",
    public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`,
  }),
});

const imageUpload = multer({ storage: imageStorage, limits: { fileSize: 4 * 1024 * 1024 } });
const docUpload = multer({ storage: docStorage, limits: { fileSize: 4 * 1024 * 1024 } });

module.exports = { imageUpload, docUpload };
