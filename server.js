const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;


// ✅ Initialize the database connection once
global.db = new sqlite3.Database(path.join(__dirname, "DB.sqlite"), (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

// ✅ Use Write-Ahead Logging (WAL) for performance
global.db.run("PRAGMA journal_mode=WAL;");



// ✅ Middleware
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve Static Files
app.use(express.static(path.join(__dirname, "public"), { index: false }));

// ✅ Routes
const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const { authenticateUser } = require("./middleware/authMiddleware");


app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);
app.use(authenticateUser);

app.get("/", (req, res) => {
  if (req.cookies.sessionToken) {
    res.sendFile(path.join(__dirname, "public", "home.html")); // ✅ Go to Home if logged in
  } else {
    res.sendFile(path.join(__dirname, "public", "login.html")); // ✅ Go to Login if not logged in
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
