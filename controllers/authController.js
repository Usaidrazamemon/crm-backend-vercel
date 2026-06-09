const User = require("../models/User");
const Log = require("../models/Log");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateAgentId = async () => {
  const count = await User.countDocuments({ role: "agent" });
  const num = String(count + 1).padStart(4, "0");
  return `AGT-${num}`;
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, agentType, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let agentId = "";
    if (role === "agent") agentId = await generateAgentId();

    const user = await User.create({
      name, email, password: hashedPassword,
      role: role || "agent", agentType: agentType || "",
      phone: phone || "", agentId, status: "Active",
    });

    res.json({ msg: "User registered successfully", agentId });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    try {
      await Log.create({
        user: user._id, userName: user.name,
        userEmail: user.email, userRole: user.role,
        action: "login", ip: req.ip || req.headers["x-forwarded-for"] || "",
      });
    } catch (logErr) { console.log("Log error:", logErr.message); }

    const token = jwt.sign(
      { id: user._id, role: user.role, agentType: user.agentType },
      process.env.JWT_SECRET, { expiresIn: "1d" }
    );

    res.json({
      msg: "Login successful", token,
      user: { id: user._id, name: user.name, role: user.role, agentType: user.agentType, agentId: user.agentId },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};