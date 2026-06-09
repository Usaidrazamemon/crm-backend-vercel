const Lead = require("../models/Lead");
const User = require("../models/User");

// ============ AUTO GENERATE AGENT ID ============
const generateAgentId = async () => {
  const count = await User.countDocuments({ role: "agent" });
  const num = String(count + 1).padStart(4, "0");
  return `AGT-${num}`;
};

// ============ AUTO GENERATE WORK ORDER ============
const generateWorkOrder = async () => {
  const count = await Lead.countDocuments({ workOrder: { $ne: "" } });
  const num = String(count + 1).padStart(4, "0");
  return `WO-${num}`;
};

// ===================================================
// ============ LEAD MANAGEMENT ============
// ===================================================

exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ status: { $in: ["Unverified", "Verified"] } })
      .populate("agent", "name email agentType agentId")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId)
      .populate("agent", "name email agentType agentId")
      .populate("verifiedBy", "name email");
    if (!lead) return res.status(404).json({ msg: "Lead not found" });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ============ ADMIN CAN EDIT ANY LEAD ============
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.leadId,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )
      .populate("agent", "name email agentType agentId")
      .populate("verifiedBy", "name email");
    if (!lead) return res.status(404).json({ msg: "Lead not found" });
    res.json({ msg: "Lead updated successfully", lead });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.leadId);
    if (!lead) return res.status(404).json({ msg: "Lead not found" });
    res.json({ msg: "Lead deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ============ PAYMENT STATUS ============
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { paymentStatus } = req.body;

    const allowedStatuses = ["Clear", "Canceled", "Installed", "Chargedback"];
    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({ msg: "Invalid payment status" });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ msg: "Lead not found" });

    lead.paymentStatus = paymentStatus;
    lead.status = "Processed";
    lead.processedAt = new Date();
    await lead.save();

    res.json({ msg: "Payment status updated", lead });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ============ PROCESSED LEADS ============
exports.getProcessedLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ status: "Processed" })
      .populate("agent", "name email agentType agentId")
      .populate("verifiedBy", "name email")
      .sort({ processedAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ============ DASHBOARD STATS ============
exports.getDashboardStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const unverifiedLeads = await Lead.countDocuments({ status: "Unverified" });
    const verifiedLeads = await Lead.countDocuments({ status: "Verified" });
    const processedLeads = await Lead.countDocuments({ status: "Processed" });

    const byAgentType = await Lead.aggregate([
      {
        $lookup: {
          from: "users", localField: "agent",
          foreignField: "_id", as: "agentInfo",
        },
      },
      { $unwind: "$agentInfo" },
      { $group: { _id: "$agentInfo.agentType", count: { $sum: 1 } } },
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const leadsOverTime = await Lead.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ totalLeads, unverifiedLeads, verifiedLeads, processedLeads, byAgentType, leadsOverTime });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ===================================================
// ============ USER MANAGEMENT ============
// ===================================================

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ============ CREATE AGENT — AUTO AGENT ID ============
exports.createAgentProfile = async (req, res) => {
  try {
    const { name, email, password, agentType, phone } = req.body;

    if (!name || !email || !password || !agentType) {
      return res.status(400).json({ msg: "Please fill all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Auto generate unique Agent ID
    const agentId = await generateAgentId();

    const user = await User.create({
      name, email,
      password: hashedPassword,
      role: "agent",
      agentType,
      phone: phone || "",
      agentId,
      status: "Active",
    });

    res.json({
      msg: "Agent profile created successfully",
      agentId,
      user: { id: user._id, name: user.name, email: user.email, agentType: user.agentType, agentId }
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId, req.body, { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "User updated", user });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "User deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ============ GET LOGIN LOGS ============
exports.getLogs = async (req, res) => {
  try {
    const Log = require("../models/log");
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ============ AUTO WORK ORDER (for verifier) ============
exports.getNextWorkOrder = async (req, res) => {
  try {
    const workOrder = await generateWorkOrder();
    res.json({ workOrder });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
