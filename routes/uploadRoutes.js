const router = require("express").Router();
const path = require("path");
const Lead = require("../models/Lead");
const upload = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");

router.use(auth);

// Upload docs + photos for a lead
router.post("/:leadId", upload.fields([
  { name: "docs", maxCount: 10 },
  { name: "photos", maxCount: 10 },
]), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ msg: "Lead not found" });

    const docPaths = req.files?.docs?.map(f => `/uploads/docs/${f.filename}`) || [];
    const photoPaths = req.files?.photos?.map(f => `/uploads/photos/${f.filename}`) || [];

    lead.docs = [...lead.docs, ...docPaths];
    lead.photos = [...lead.photos, ...photoPaths];
    await lead.save();

    res.json({ msg: "Files uploaded successfully", docs: lead.docs, photos: lead.photos });
  } catch (err) {
    res.status(500).json({ msg: "Upload failed", error: err.message });
  }
});

// Add call log note
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
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

module.exports = router;