

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1. Photos Storage Configuration
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "crm/photos",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

// 2. Documents Storage Configuration (Fixed for Vercel & Cloudinary)
const docStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // File extension extract kar rahe hain safely
    const ext = file.originalname.split('.').pop().toLowerCase();
    
    // PDF ko Cloudinary as image handle kar sakta hai, baaki sab raw jayengi
    const isPdf = ext === 'pdf';
    
    return {
      folder: "crm/docs",
      resource_type: isPdf ? "image" : "raw", 
      public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9]/g, "_")}`,
    };
  }
});

// 3. Multer Setup With Vercel-Safe Limits (Max 4MB taaki 4.5MB ki limit cross na ho)
const VERCEL_FILE_SIZE_LIMIT = 4 * 1024 * 1024; // 4MB

const imageUpload = multer({ 
  storage: imageStorage, 
  limits: { fileSize: VERCEL_FILE_SIZE_LIMIT } 
});

const docUpload = multer({ 
  storage: docStorage, 
  limits: { fileSize: VERCEL_FILE_SIZE_LIMIT } 
});

module.exports = { imageUpload, docUpload };
