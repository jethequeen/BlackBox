const express = require("express");
const router = express.Router();
const {FILTER_MAPPING, searchQueryMap} = require("../util/FilterMapping");
const { buildQuery } = require("../util/queryBuilder");

router.post("/build-query", (req, res) => {
  const sessionToken = req.cookies.sessionToken;

  global.db.get("SELECT AccountID FROM Sessions WHERE SessionID = ?", [sessionToken], (err, row) => {
    if (err) {
      console.error("❌ Error retrieving AccountID:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (!row) {
      console.error("❌ Invalid session token");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const accountID = row.AccountID;
    console.log("✅ AccountID Retrieved:", accountID);

    try {
      const filters = req.body.filters;
      const { query, values } = buildQuery(filters, accountID);

      console.log("🔍 Final Query Values (Before Execution):", values);
      res.json({ query, values });
    } catch (error) {
      console.error("❌ Error building query:", error);
      res.status(500).json({ error: "Failed to generate query." });
    }
  });
});





router.get("/search-suggestions", (req, res) => {
  let { q, type, award } = req.query;
  let sqlQuery = searchQueryMap[type];
  let params = [`%${q}%`];

  if (type === "category" && award) {
    sqlQuery = searchQueryMap.category;
    params = [award, `%${q}%`];
  }

  console.log(`🔹 Running Query: ${sqlQuery}, Params: ${params}`);

  global.db.all(sqlQuery, params, (err, rows) => {
    if (err) {
      console.error("❌ Database Error:", err.message);
      return res.status(500).json({ error: "Database query error." });
    }

    console.log(`✅ Search results for '${q}' [${type}]:`, rows);
    res.json(rows);
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
        console.error("SQL Error in /search-movie (Auto Role Detection):", err.message);
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

router.post("/fetchMovies", (req, res) => {
  const { query, values } = req.body;

  if (!query || !values) {
    return res.status(400).json({ error: "Invalid query parameters." });
  }

  console.log("Executing SQL Query:", query);
  console.log("Query Values:", values);

  global.db.all(query, values, (err, rows) => {
    if (err) {
      console.error("Database Execution Error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});



module.exports = router;
