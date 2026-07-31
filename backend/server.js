require("dotenv").config();
const express = require("express");
const cors = require("cors");
const notesRouter = require("./routes/notes");
const { startCleanupJob } = require("./utils/cleanup");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  methods: ["GET", "POST"],
  process.env.FRONTEND_URL,
}));

app.use(express.json());

app.use("/api/notes", notesRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SecrNote backend running on http://localhost:${PORT}`);
  startCleanupJob();
});