const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;


global.db = new sqlite3.Database(path.join(__dirname, "DB.sqlite"), (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

global.db.run("PRAGMA journal_mode=WAL;");



app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"), { index: false }));

const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const algorithmRoutes = require("./routes/algorithm");
const { authenticateUser } = require("./middleware/authMiddleware");

// ✅ Public routes (auth should not require authentication)
app.use("/auth", authRoutes);

// ✅ Apply authentication only after login/signup routes
app.use(authenticateUser);

app.use("/movies", movieRoutes);
app.use("/algorithm", algorithmRoutes);

app.get("/", (req, res) => {
  if (req.cookies.sessionToken) {
    res.sendFile(path.join(__dirname, "public", "home.html"));
  } else {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
