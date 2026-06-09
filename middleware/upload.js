const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Uploads folder banana
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const docsDir = path.join(uploadDir, "docs");
const photosDir = path.join(uploadDir, "photos");
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);
if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir);

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, photosDir);
    } else {
      cb(null, docsDir);
    }
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

module.exports = upload;