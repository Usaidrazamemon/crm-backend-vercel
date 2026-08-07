const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    // ============ SECTION 1: Basic Info ============
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    primaryEmail: { type: String, default: "" },
    mobilePhone: { type: String, required: true },
    secondaryPhone: { type: String, default: "" },

    // ============ SECTION 2: Identification ============
    accountNumber: { type: String, default: "" },
    dsiId: { type: String, default: "" },
    activityId: { type: String, default: "" },
    ssn: { type: String, default: "" },
    dob: { type: Date, default: null },
    pin: { type: String, default: "" },
    securityAnswer: { type: String, default: "" },

    // ============ SECTION 3: Address ============
    address: { type: String, default: "" },
    address2: { type: String, default: "" },
    city: { type: String, default: "" },
    usState: { type: String, default: "" },
    zip: { type: String, default: "" },
    zipcode4: { type: String, default: "" },
    county: { type: String, default: "" },
    previousAddressSame: { type: Boolean, default: true },

    // ============ SECTION 4: Identity Docs ============
    driverNumber: { type: String, default: "" },
    driverState: { type: String, default: "" },
    driverExp: { type: Date, default: null },

    // ============ SECTION 5: Preferences ============
    receiveText: { type: Boolean, default: false },
    receiveEmail: { type: Boolean, default: false },
    language: { type: String, default: "English" },
    customerConsents: { type: Boolean, default: false },

    // ============ SECTION 6: Business Info ============
    spCustomerId: { type: String, default: "" },
    campaign: { type: String, default: "" },
    channel: { type: String, default: "" },
    processorChannel: { type: String, default: "" },
    area: { type: String, default: "" },
    rep: { type: String, default: "" },

    // ============ SECTION 7: Additional ============
    creditRisk: { type: String, default: "" },
    followUp: {
      type: String,
      enum: ["None", "Today", "Tomorrow", "This Week", "Next Week"],
      default: "None",
    },
    workflowStatus: {
      type: String,
      enum: ["Pending", "Pass", "Cancel", "Fraud", "Duplicate", "Reject"],
      default: "Pending",
    },
    assignedTo: { type: String, default: "" },
    link: { type: String, default: "" },

    // ============ SECTION 8: System Fields ============
    firstTouch: { type: Date, default: null },
    converted: { type: Boolean, default: false },
    isCustomer: { type: Boolean, default: false },

    // ============ AGENT INFO ============
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agentType: {
      type: String,
      enum: ["Inhouse", "Agent", "D2D Sales"],
      default: "Agent",
    },

    // ============ VERIFIER FIELDS ============
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifierRemarks: { type: String, default: "" },
    workOrder: { type: String, default: "" },
    prepayment: { type: Number, default: 0 },
    verifiedAt: { type: Date, default: null },

    // ============ ADMIN FIELDS ============
    paymentStatus: {
      type: String,
      enum: ["", "Clear", "Canceled", "Installed", "Chargedback"],
      default: "",
    },
    processedAt: { type: Date, default: null },

    // ============ ATTACHMENTS ============
    docs: [{ type: String }],       // file paths/urls
    photos: [{ type: String }],     // file paths/urls
    callLogs: [
      {
        note: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ============ OVERALL STATUS ============
    status: {
      type: String,
      enum: ["Unverified", "Verified", "Processed", "Rejected"],
      default: "Unverified",
    },
  },
  {
    timestamps: true, // createdAt aur updatedAt auto set hoga
  }
);

module.exports = mongoose.model("Lead", leadSchema);
