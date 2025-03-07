const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public", {index: "home.html"}));

// Connexion à la base de données SQLite
const db = new sqlite3.Database("C:/BlackBox/BlackBox Database/Base De Donnees.sqlite", (err) => {
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

    res.json(row);
  });
});

app.get("/search-movie", (req, res) => {
  const searchQuery = req.query.q.trim();
  const role = req.query.role || "auto"; // Default to auto

  if (!searchQuery) {
    return res.status(400).json({ error: "No search query provided" });
  }


  // ✅ Auto-detect whether person is more often an actor or director
  if (role === "auto") {
    const countQuery = `
      SELECT
        (SELECT COUNT(*) FROM FilmCast
         INNER JOIN "Cast" ON FilmCast.CastID = "Cast".TMDB_ID
         WHERE "Cast".Name = ?) AS actor_count,
        (SELECT COUNT(*) FROM FilmCrew
         INNER JOIN Crew ON FilmCrew.CrewTMDB_ID = Crew.TMDB_ID
         WHERE Crew.Name = ? AND FilmCrew.Job = 'Director') AS director_count
    `;

    db.get(countQuery, [searchQuery, searchQuery], (err, row) => {
      if (err) {
        console.error("❌ SQL Error in /search-movie (Auto Role Detection):", err.message);
        res.status(500).json({ error: err.message });
        return;
      }

      let detectedRole = "actor"; // Default to actor
      if (row.director_count > row.actor_count) {
        detectedRole = "director";
      }

      return searchMoviesByRole(searchQuery, detectedRole, res);
    });
  } else {
    return searchMoviesByRole(searchQuery, role, res);
  }
});

// ✅ Function to search movies based on detected role
function searchMoviesByRole(searchQuery, role, res) {
  let sql;
  let params = [searchQuery];

  if (role === "actor") {
    sql = `
      SELECT Films.ID, Films.Title, Films.OriginalTitle, Films.Year, Films.Runtime, Films.Country,
             Films.Budget, Films.Revenue, Films.Adults, Films.short_url, Films.slug, Films.long_url, Films.imdb_id
      FROM Films
      WHERE Films.ID IN (
          SELECT FilmID FROM FilmCast WHERE CastID = (SELECT TMDB_ID FROM "Cast" WHERE Name = ?)
      )
      ORDER BY RANDOM();
    `;
  } else if (role === "director") {
    sql = `
      SELECT Films.ID, Films.Title, Films.OriginalTitle, Films.Year, Films.Runtime, Films.Country,
             Films.Budget, Films.Revenue, Films.Adults, Films.short_url, Films.slug, Films.long_url, Films.imdb_id
      FROM Films
      WHERE Films.ID IN (
          SELECT FilmID FROM FilmCrew WHERE CrewTMDB_ID = (SELECT TMDB_ID FROM Crew WHERE Name = ?) AND FilmCrew.Job = 'Director'
      )
      ORDER BY RANDOM();
    `;
  } else {
    return res.status(400).json({ error: "Invalid role specified" });
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("❌ SQL Error in /search-movie:", err.message);
      res.status(500).json({ error: err.message });
      return;
    }

    if (!rows.length) {
      res.status(404).json({ error: "No matching movies found" });
      return;
    }

    res.json(rows);
  });
}



app.get("/search-suggestions", (req, res) => {
  const searchQuery = req.query.q.trim();

  if (!searchQuery) {
    return res.status(400).json({ error: "No search query provided" });
  }


  const sql = `
    SELECT Name, MAX(Popularity) AS max_popularity FROM (
                                                          SELECT "Cast".Name, "Cast".Popularity
                                                          FROM "Cast"
                                                          WHERE "Cast".Name LIKE ?
                                                          UNION
                                                          SELECT Crew.Name, Crew.Popularity
                                                          FROM Crew
                                                          WHERE Crew.Name LIKE ? AND Crew.TMDB_ID IN (
                                                            SELECT CrewTMDB_ID FROM FilmCrew WHERE FilmCrew.Job = 'Director'
                                                          )
                                                        ) AS People
    GROUP BY Name
    ORDER BY max_popularity DESC
    LIMIT 10;
  `;

  db.all(sql, [`%${searchQuery}%`, `%${searchQuery}%`], (err, rows) => {
    if (err) {
      console.error("❌ SQL Error in /search-suggestions:", err.message);
      res.status(500).json({ error: err.message });
      return;
    }


    if (!rows.length) {
      res.status(404).json({ error: "No matching names found" });
      return;
    }

    res.json(rows.map(row => row.Name)); // Return only names
  });
});

// API route to trigger the update batch file
app.post("/run-update", (req, res) => {
  console.log("🔄 Running update batch file...");

  const batchFilePath = path.join(__dirname, "update.bat"); // ✅ Ensure correct path

  exec(`cmd /c "${batchFilePath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Update failed: ${error.message}`);
      return res.status(500).json({ success: false, message: "Update failed", error: error.message });
    }
    console.log(`✅ Update output: ${stdout}`);
    res.json({ success: true, message: "Update started successfully!", output: stdout });
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
