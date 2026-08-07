const Lead = require("../models/Lead");

// ============ SUBMIT LEAD ============
exports.submitLead = async (req, res) => {
  try {
    const {
      firstName, lastName, primaryEmail, mobilePhone, secondaryPhone,
      accountNumber, dsiId, activityId, ssn, dob, pin, securityAnswer,
      address, address2, city, usState, zip, zipcode4, county, previousAddressSame,
      driverNumber, driverState, driverExp,
      receiveText, receiveEmail, language, customerConsents,
      spCustomerId, campaign, channel, processorChannel, area, rep,
      creditRisk, followUp, assignedTo, link,
    } = req.body;

    if (!firstName || !lastName || !mobilePhone) {
      return res.status(400).json({ msg: "First name, last name aur mobile phone required hain" });
    }

    // Duplicate Detection
    const duplicateChecks = [];
    if (mobilePhone) {
      const phoneExists = await Lead.findOne({ mobilePhone });
      if (phoneExists) duplicateChecks.push(`Mobile phone (${mobilePhone}) already exists — Lead ID: #${phoneExists._id.toString().slice(-6).toUpperCase()}`);
    }
    if (primaryEmail) {
      const emailExists = await Lead.findOne({ primaryEmail });
      if (emailExists) duplicateChecks.push(`Email (${primaryEmail}) already exists — Lead ID: #${emailExists._id.toString().slice(-6).toUpperCase()}`);
    }
    if (ssn) {
      const ssnExists = await Lead.findOne({ ssn });
      if (ssnExists) duplicateChecks.push(`SSN already exists — Lead ID: #${ssnExists._id.toString().slice(-6).toUpperCase()}`);
    }
    if (duplicateChecks.length > 0) {
      return res.status(409).json({ msg: "Duplicate lead detected!", duplicates: duplicateChecks, isDuplicate: true });
    }

    const lead = await Lead.create({
      firstName, lastName,
      primaryEmail: primaryEmail || "",
      mobilePhone,
      secondaryPhone: secondaryPhone || "",
      accountNumber: accountNumber || "",
      dsiId: dsiId || "",
      activityId: activityId || "",
      ssn: ssn || "",
      dob: dob || null,
      pin: pin || "",
      securityAnswer: securityAnswer || "",
      address: address || "",
      address2: address2 || "",
      city: city || "",
      usState: usState || "",
      zip: zip || "",
      zipcode4: zipcode4 || "",
      county: county || "",
      previousAddressSame: previousAddressSame ?? true,
      driverNumber: driverNumber || "",
      driverState: driverState || "",
      driverExp: driverExp || null,
      receiveText: receiveText || false,
      receiveEmail: receiveEmail || false,
      language: language || "English",
      customerConsents: customerConsents || false,
      spCustomerId: spCustomerId || "",
      campaign: campaign || "",
      channel: channel || "",
      processorChannel: processorChannel || "",
      area: area || "",
      rep: rep || "",
      creditRisk: creditRisk || "",
      followUp: followUp || "None",
      assignedTo: assignedTo || "",
      link: link || "",
      agent: req.user.id,
      agentType: req.user.agentType || "Agent",
      status: "Unverified",
      workflowStatus: "Pending",
      firstTouch: new Date(),
    });

    res.json({ msg: "Lead submitted successfully", lead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ============ GET MY LEADS ============
exports.getMyLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ agent: req.user.id })
      .populate("agent", "name email agentType agentId")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ============ GET VERIFIED LEADS ============
exports.getMyVerifiedLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ agent: req.user.id, status: "Verified" })
      .populate("agent", "name email agentType agentId")
      .populate("verifiedBy", "name email")
      .sort({ verifiedAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ============ GET SINGLE LEAD ============
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.leadId, agent: req.user.id })
      .populate("agent", "name email agentType agentId")
      .populate("verifiedBy", "name email");
    if (!lead) return res.status(404).json({ msg: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ============ SAVE DRAFT ============
exports.saveDraft = async (req, res) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      agent: req.user.id,
      agentType: req.user.agentType || "Agent",
      status: "Unverified",
      workflowStatus: "Pending",
    });
    res.json({ msg: "Draft saved successfully", lead });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ============ UPDATE MY LEAD (Agent) ============
// Agents can only edit their own leads, and only basic/contact/address fields.
// Verification, workflow, and payment fields stay admin/verifier-only.
const AGENT_EDITABLE_FIELDS = [
  "firstName", "lastName", "primaryEmail", "mobilePhone", "secondaryPhone",
  "accountNumber", "ssn", "assignedTo",
  "address", "address2", "city", "usState", "zip", "zipcode4", "county",
  "campaign", "channel", "area", "rep", "creditRisk", "followUp", "link",
];

exports.updateMyLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.leadId, agent: req.user.id });
    if (!lead) return res.status(404).json({ msg: "Lead not found" });

    const updates = {};
    for (const field of AGENT_EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }
    updates.updatedAt = new Date();

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.leadId,
      updates,
      { new: true }
    )
      .populate("agent", "name email agentType agentId")
      .populate("verifiedBy", "name email");

    res.json({ msg: "Lead updated successfully", lead: updatedLead });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
