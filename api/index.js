
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("../config/db");

const app = express();

const allowedOrigins = [
  "https://connectcareglobal.com",
  "https://www.connectcareglobal.com",
  "https://crm-frontend-seven-steel.vercel.app",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((o) => o.trim().replace(/\/$/, ""));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.json());

connectDB();

app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/leads", require("../routes/leadRoutes"));
app.use("/api/verifier", require("../routes/verifierRoutes"));
app.use("/api/admin", require("../routes/adminRoutes"));
app.use("/api/upload", require("../routes/uploadRoutes"));

app.get("/", (req, res) => res.json({ status: "CRM Backend Running ✅" }));

module.exports = app;
