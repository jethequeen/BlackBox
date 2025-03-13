const express = require("express");
const {buildQuery} = require("../util/queryBuilder");
const router = express.Router();

router.post("/saveAlgorithm", (req, res) => {
  let query = req.body;
  const sessionToken = req.cookies.sessionToken;

  if (!sessionToken) {
    return res.status(401).json({ error: "User not authenticated (no sessionToken found)" });
  }

  db.get(
    "SELECT AccountID FROM Sessions WHERE SessionID = ?",
    [sessionToken],
    (err, row) => {
      const AccountID = row.AccountID;

      db.run(
        "INSERT INTO Algorithms (user_id, name) VALUES (?, ?)",
        [AccountID, query.name],
        function () {

          const algorithmId = this.lastID;

          if (!query.parameters || query.parameters.length === 0) {
            return res.json({success: true, id: algorithmId});
          }
          const paramPromises = query.parameters.map(p => {
            return new Promise((resolve, reject) => {
              db.run(
                "INSERT INTO AlgorithmParameters (algorithm_id, parameter_key, parameter_value) VALUES (?, ?, ?)",
                [algorithmId, p.key, p.value],
                function (err) {
                  if (err) { reject(err); }
                  else     { resolve();   }
                }
              );
            });
          });

          Promise.all(paramPromises)
            .then(() => res.json({success: true, id: algorithmId}))
            .catch(error => {
              res.status(500).json({error: error.message});
            });
        }
      );
    });
});

router.get("/getAlgorithms", (req, res) => {
  const sessionToken = req.cookies.sessionToken;

  if (!sessionToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sqlQuery = `
    SELECT Algorithms.ID, Algorithms.Name
    FROM Algorithms
    JOIN Sessions ON Algorithms.user_id = Sessions.AccountID
    WHERE Sessions.SessionID = ?
  `;

  db.all(sqlQuery, [sessionToken], (err, rows) => {
    res.json(rows);
  });
});

router.get("/getAlgorithm/:id", (req, res) => {
  const { id } = req.params;
  db.all("SELECT parameter_key, parameter_value FROM AlgorithmParameters WHERE algorithm_id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get("/recommendMovie/:algorithm_id", (req, res) => {
  const { algorithm_id } = req.params;

  db.all(
    "SELECT parameter_key, parameter_value FROM AlgorithmParameters WHERE algorithm_id = ?",
    [algorithm_id],
    (err, filters) => {
      if (err) return res.status(500).json({ error: err.message });

      // Convert `filters` into an object for `buildQuery`
      const filterObject = filters.reduce((acc, { parameter_key, parameter_value }) => {
        acc[parameter_key] = parameter_value;
        return acc;
      }, {});

      const query = buildQuery(filterObject);
      const values = Object.values(filterObject);

      db.get(query + " LIMIT 5", values, (err, movie) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(movie || { message: "No matching movies found." });
      });
    }
  );
});

router.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});

router.get("/getAlgorithmParams", (req, res) => {
  const { algorithmID } = req.query;

  if (!algorithmID) {
    return res.status(400).json({ error: "Algorithm ID is required." });
  }

  const sqlQuery = `
    SELECT parameter_key AS key, parameter_value AS value
    FROM AlgorithmParameters
    WHERE algorithm_id = ?
  `;

  db.all(sqlQuery, [algorithmID], (err, rows) => {
    res.json(rows);
  });
});





module.exports = router;
