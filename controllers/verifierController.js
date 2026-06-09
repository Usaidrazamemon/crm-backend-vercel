const Lead = require("../models/Lead");

// Auto generate Work Order
const generateWorkOrder = async () => {
  const count = await Lead.countDocuments({ workOrder: { $ne: "" } });
  const num = String(count + 1).padStart(4, "0");
  return `WO-${num}`;
};

// GET pending leads
exports.getPendingLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ status: "Unverified" })
      .populate("agent", "name email agentType agentId")
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// GET verified leads
exports.getVerifiedLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ status: "Verified" })
      .populate("agent", "name email agentType agentId")
      .populate("verifiedBy", "name email")
      .sort({ verifiedAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// VERIFY lead — auto work order
exports.verifyLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { workflowStatus, remarks, workOrder, prepayment } = req.body;

    if (!workflowStatus) {
      return res.status(400).json({ msg: "Workflow status required" });
    }

    const allowedStatuses = ["Pass", "Cancel", "Fraud", "Duplicate"];
    if (!allowedStatuses.includes(workflowStatus)) {
      return res.status(400).json({ msg: "Invalid workflow status" });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ msg: "Lead not found" });

    // Auto generate work order if not provided
    const finalWorkOrder = workOrder || await generateWorkOrder();

    lead.workflowStatus = workflowStatus;
    lead.verifierRemarks = remarks || "";
    lead.workOrder = finalWorkOrder;
    lead.prepayment = prepayment || 0;
    lead.verifiedBy = req.user.id;
    lead.verifiedAt = new Date();
    lead.status = "Verified";

    await lead.save();

    res.json({ msg: "Lead verified successfully", lead });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// REJECT lead
exports.rejectLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({ msg: "Remarks required for rejection" });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ msg: "Lead not found" });

    lead.workflowStatus = "Cancel";
    lead.verifierRemarks = remarks;
    lead.verifiedBy = req.user.id;
    lead.verifiedAt = new Date();
    lead.status = "Rejected";

    await lead.save();

    res.json({ msg: "Lead rejected successfully", lead });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};