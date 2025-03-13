const express = require("express");
const router = express.Router();
const { buildQuery } = require("../util/queryBuilder");
const {searchQueryMap} = require("../util/FilterMapping");

router.post("/build-query", (req, res) => {
  const sessionToken = req.cookies.sessionToken;

  db.get("SELECT AccountID FROM Sessions WHERE SessionID = ?", [sessionToken], (err, row) => {
    const accountID = row.AccountID;
    try {
      const filters = req.body.filters;
      const { query, values } = buildQuery(filters, accountID);
      res.json({ query, values });
    } catch (error) {
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

  db.all(sqlQuery, params, (err, rows) => {
    res.json(rows);
  });
});

router.post("/fetchMovies", (req, res) => {
  const { query, values } = req.body;

  if (!query || !values) {
    return res.status(400).json({ error: "Invalid query parameters." });
  }

  console.log("Executing SQL Query:", query);
  console.log("Query Values:", values);

  db.all(query, values, (err, rows) => {
    if (err) {
      console.error("Database Execution Error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});



module.exports = router;
