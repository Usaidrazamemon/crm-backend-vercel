

const router = require("express").Router();
const Lead = require("../models/Lead");
const { imageUpload, docUpload } = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");

router.use(auth);

// Upload photos
router.post("/:leadId/photos", imageUpload.array("photos", 10), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ msg: "Lead not found" });

    const photoPaths = req.files?.map(f => f.path) || [];
    lead.photos = [...lead.photos, ...photoPaths];
    await lead.save();

    res.json({ msg: "Photos uploaded!", photos: lead.photos });
  } catch (err) {
    console.error("Photo upload error:", err);
    res.status(500).json({ msg: "Upload failed", error: err.message });
  }
});

// Upload docs
router.post("/:leadId/docs", docUpload.array("docs", 10), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ msg: "Lead not found" });

    const docPaths = req.files?.map(f => f.path) || [];
    lead.docs = [...lead.docs, ...docPaths];
    await lead.save();

    res.json({ msg: "Docs uploaded!", docs: lead.docs });
  } catch (err) {
    console.error("Doc upload error:", err);
    res.status(500).json({ msg: "Upload failed", error: err.message });
  }
});

// Combined upload (backward compat)
router.post("/:leadId", async (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart")) {
    imageUpload.fields([
      { name: "photos", maxCount: 10 },
      { name: "docs", maxCount: 10 },
    ])(req, res, async (err) => {
      if (err) return res.status(500).json({ msg: err.message });
      try {
        const lead = await Lead.findById(req.params.leadId);
        if (!lead) return res.status(404).json({ msg: "Lead not found" });

        const photoPaths = req.files?.photos?.map(f => f.path) || [];
        const docPaths = req.files?.docs?.map(f => f.path) || [];

        lead.photos = [...lead.photos, ...photoPaths];
        lead.docs = [...lead.docs, ...docPaths];
        await lead.save();

        res.json({ msg: "Files uploaded!", docs: lead.docs, photos: lead.photos });
      } catch (e) {
        res.status(500).json({ msg: e.message });
      }
    });
  } else {
    next();
  }
});

router.post("/:leadId/calllog", async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ msg: "Note required" });
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ msg: "Lead not found" });
    lead.callLogs.push({ note, createdAt: new Date() });
    await lead.save();
    res.json({ msg: "Call log added", callLogs: lead.callLogs });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
