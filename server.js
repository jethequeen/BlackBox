const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;


const isDocker = process.env.IN_DOCKER || false;

const dbPath = isDocker ? "/app/Base_de_Donnees.sqlite" : path.join(__dirname, "DB.sqlite");

global.db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
});


// Force SQLite to flush writes to the disk
global.db.run("PRAGMA wal_checkpoint(FULL);", (err) => {
  if (err) console.error("Error running WAL checkpoint:", err.message);
  else console.log("WAL checkpoint executed successfully.");
});

// Enable WAL mode
global.db.run("PRAGMA journal_mode=WAL;");




app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"), { index: false }));

const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const { authenticateUser } = require("./middleware/authMiddleware");


app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);
app.use(authenticateUser);

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
