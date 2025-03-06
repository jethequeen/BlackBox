const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public", {index: "home.html"}));

// Connexion à la base de données SQLite
const db = new sqlite3.Database("./Base de Donnees.sqlite", (err) => {
  if (err) {
    console.error("Erreur lors de l'ouverture de la base de données:", err.message);
  } else {
    console.log("Connecté à la base de données SQLite");
  }
});


// Différentes routes

// Route pour récupérer les données
app.get("/data", (req, res) => {
  db.all("SELECT * FROM FilmsWatched", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});



app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});


app.get("/random-movie", (req, res) => {
  db.get("SELECT * FROM Films ORDER BY RANDOM() LIMIT 1", [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(404).json({ error: "Aucun film trouvé." });
      return;
    }

    console.log("Film sélectionné :", row);
    res.json(row);
  });
});



app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur accessible sur : http://${getLocalIP()}:${PORT}`);
});

function getLocalIP() {
  const os = require("os");
  const interfaces = os.networkInterfaces();
  for (let iface of Object.values(interfaces)) {
    for (let i of iface) {
      if (i.family === "IPv4" && !i.internal) {
        return i.address;
      }
    }
  }
  return "127.0.0.1";
}
