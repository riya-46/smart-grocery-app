const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const groceryRoutes = require("./routes/groceryRoutes");

dotenv.config();

connectDB();

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/groceries", groceryRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "smart-grocery-backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("Smart Grocery Backend Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
