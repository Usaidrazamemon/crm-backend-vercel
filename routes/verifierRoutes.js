
const router = require("express").Router();
const {
  getPendingLeads,
  getVerifiedLeads,
  verifyLead,
  rejectLead,
} = require("../controllers/verifierController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// 🔒 Saare routes verifier only hain
router.use(auth);
router.use(role("verifier"));

// ============ LEADS ============
router.get("/pending", getPendingLeads);       // Unverified leads
router.get("/verified", getVerifiedLeads);     // Verified leads

// ============ ACTIONS ============
router.put("/verify/:leadId", verifyLead);     // Verify with workOrder + prepayment
router.put("/reject/:leadId", rejectLead);     // Reject with remarks

module.exports = router;