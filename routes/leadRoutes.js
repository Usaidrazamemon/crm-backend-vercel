const router = require("express").Router();
const {
  submitLead,
  getMyLeads,
  getMyVerifiedLeads,
  getLeadById,
  saveDraft,
} = require("../controllers/leadController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// 🔒 Saare routes agent only hain
router.use(auth);
router.use(role("agent"));

// ============ LEADS ============
router.post("/", submitLead);                        // Lead submit karo
router.post("/draft", saveDraft);                    // Draft save karo
router.get("/", getMyLeads);                         // Apne saare leads
router.get("/verified", getMyVerifiedLeads);         // Apne verified leads
router.get("/:leadId", getLeadById);                 // Single lead detail

module.exports = router;