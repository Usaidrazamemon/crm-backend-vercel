const router = require("express").Router();
const {
  getAllLeads, getLeadById, updateLead, deleteLead,
  updatePaymentStatus, getProcessedLeads,
  getDashboardStats,
  getAllUsers, getUsersByRole, createAgentProfile, updateUser, deleteUser,
  getLogs, getNextWorkOrder,
} = require("../controllers/adminController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.use(auth);
router.use(role("admin"));

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// Leads
router.get("/leads", getAllLeads);
router.get("/leads/processed", getProcessedLeads);
router.get("/leads/:leadId", getLeadById);
router.put("/leads/:leadId", updateLead);
router.delete("/leads/:leadId", deleteLead);

// Payment
router.put("/leads/:leadId/payment", updatePaymentStatus);

// Users
router.get("/users", getAllUsers);
router.get("/users/role/:role", getUsersByRole);
router.post("/users/create-agent", createAgentProfile);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

// Logs
router.get("/logs", getLogs);

// Work Order
router.get("/workorder/next", getNextWorkOrder);

module.exports = router;