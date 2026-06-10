
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("../config/db");

const app = express();

app.use(cors({
  origin: [
    "https://crm-frontend-seven-steel.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

app.use(express.json());

connectDB();

app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/leads", require("../routes/leadRoutes"));
app.use("/api/verifier", require("../routes/verifierRoutes"));
app.use("/api/admin", require("../routes/adminRoutes"));
app.use("/api/upload", require("../routes/uploadRoutes"));

app.get("/", (req, res) => res.json({ status: "CRM Backend Running ✅" }));

module.exports = app;
