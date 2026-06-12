
const router = require("express").Router();
const Lead = require("../models/Lead");
const { imageUpload, docUpload } = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");

router.use(auth);

// 1. Upload photos
router.post("/:leadId/photos", imageUpload.array("photos", 10), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ msg: "Lead not found" });

    const photoPaths = req.files?.map(f => f.path) || [];
    lead.photos = [...(lead.photos || []), ...photoPaths];
    await lead.save();

    return res.json({ msg: "Photos uploaded!", photos: lead.photos });
  } catch (err) {
    console.error("Photo upload error:", err);
    return res.status(500).json({ msg: "Upload failed", error: err.message });
  }
});

// 2. Upload docs
router.post("/:leadId/docs", docUpload.array("docs", 10), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ msg: "Lead not found" });

    const docPaths = req.files?.map(f => f.path) || [];
    lead.docs = [...(lead.docs || []), ...docPaths];
    await lead.save();

    return res.json({ msg: "Docs uploaded!", docs: lead.docs });
  } catch (err) {
    console.error("Doc upload error:", err);
    return res.status(500).json({ msg: "Upload failed", error: err.message });
  }
});

// 3. Combined upload (Fixed Error Handling for Vercel)
router.post("/:leadId", (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart")) {
    
    // Multer field execution ko safely handle kiya
    imageUpload.fields([
      { name: "photos", maxCount: 10 },
      { name: "docs", maxCount: 10 },
    ])(req, res, async (err) => {
      if (err) {
        console.error("Multer middleware error:", err);
        return res.status(500).json({ msg: "Multer parsing failed", error: err.message });
      }
      
      try {
        const lead = await Lead.findById(req.params.leadId);
        if (!lead) return res.status(404).json({ msg: "Lead not found" });

        const photoPaths = req.files?.photos?.map(f => f.path) || [];
        const docPaths = req.files?.docs?.map(f => f.path) || [];

        lead.photos = [...(lead.photos || []), ...photoPaths];
        lead.docs = [...(lead.docs || []), ...docPaths];
        await lead.save();

        return res.json({ msg: "Files uploaded!", docs: lead.docs, photos: lead.photos });
      } catch (e) {
        console.error("Database save error in combined upload:", e);
        return res.status(500).json({ msg: "Database error", error: e.message });
      }
    });
  } else {
    next();
  }
});

// 4. Call Log
router.post("/:leadId/calllog", async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ msg: "Note required" });
    
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ msg: "Lead not found" });
    
    lead.callLogs.push({ note, createdAt: new Date() });
    await lead.save();
    return res.json({ msg: "Call log added", callLogs: lead.callLogs });
  } catch (err) {
    console.error("Calllog error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
