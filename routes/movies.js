const express = require("express");
const router = express.Router();

router.get("/random-movie", (req, res) => {
  global.db.get("SELECT * FROM Films ORDER BY RANDOM() LIMIT 1", [], (err, row) => {
    if (err) {
      console.error("❌ Error fetching random movie:", err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(row);
  });
});

router.get("/search-suggestions", (req, res) => {
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
    LIMIT 5;
  `;

  global.db.all(sql, [`%${searchQuery}%`, `%${searchQuery}%`], (err, rows) => {

    if (!rows.length) {
      res.status(404).json({ error: "No matching names found" });
      return;
    }

    res.json(rows.map(row => row.Name));
  });
});


router.get("/search-movie", (req, res) => {
  const searchQuery = req.query.q.trim();
  const role = req.query.role || "auto"; // Default to auto

  if (!searchQuery) {
    return res.status(400).json({ error: "No search query provided" });
  }


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

    global.db.get(countQuery, [searchQuery, searchQuery], (err, row) => {
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

module.exports = router;
