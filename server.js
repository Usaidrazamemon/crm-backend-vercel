require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// CORS — production mein frontend URL se
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: false,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/verifier", require("./routes/verifierRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

// Health check
app.get("/", (req, res) => res.json({ status: "CRM Backend Running ✅" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

