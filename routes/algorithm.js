const express = require("express");
const router = express.Router();

router.post("/saveAlgorithm", (req, res) => {
  console.log("🔹 Received POST request to /algorithm/saveAlgorithm");
  console.log("🔹 Request Body:", JSON.stringify(req.body, null, 2)); // Debugging JSON input
  query = req.body;

  // Retrieve sessionToken from cookies
  const sessionToken = req.cookies.sessionToken;
  console.log("🔹 Extracted sessionToken from cookies:", sessionToken);

  if (!sessionToken) {
    return res.status(401).json({ error: "User not authenticated (no sessionToken found)" });
  }

  global.db.get(
    "SELECT AccountID FROM Sessions WHERE SessionID = ?",
    [sessionToken],
    (err, row) => {
      const AccountID = row.AccountID;

      global.db.run(
        "INSERT INTO Algorithms (user_id, name) VALUES (?, ?)", // Change user_id → AccountID
        [AccountID, query.name],
        function (err) {
          if (err) {
            console.error("❌ Database insert error:", err.message);
            return res.status(500).json({error: err.message});
          }

          const algorithmId = this.lastID;
          console.log("✅ Algorithm inserted with ID:", algorithmId);

          if (!query.parameters || query.parameters.length === 0) {
            return res.json({success: true, id: algorithmId});
          }

          const paramPromises = query.parameters.map(p => {
            return new Promise((resolve, reject) => {
              global.db.run(
                "INSERT INTO AlgorithmParameters (algorithm_id, parameter_key, parameter_value) VALUES (?, ?, ?)",
                [algorithmId, p.key, p.value],
                function (err) {
                  if (err) {
                    console.error("❌ Error inserting parameter:", err.message);
                    reject(err);
                  } else {
                    console.log("✅ Parameter inserted:", p);
                    resolve();
                  }
                }
              );
            });
          });

          Promise.all(paramPromises)
            .then(() => res.json({success: true, id: algorithmId}))
            .catch(error => {
              console.error("❌ Promise error:", error.message);
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

  global.db.all(sqlQuery, [sessionToken], (err, rows) => {
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

  global.db.all(
    "SELECT parameter_key, parameter_value FROM AlgorithmParameters WHERE algorithm_id = ?",
    [algorithm_id],
    (err, filters) => {
      if (err) return res.status(500).json({ error: err.message });

      // Convert `filters` into an object for `buildQuery`
      const filterObject = filters.reduce((acc, { parameter_key, parameter_value }) => {
        acc[parameter_key] = parameter_value;
        return acc;
      }, {});

      // Use buildQuery to generate the SQL query
      const query = buildQuery(filterObject);

      // Extract values to prevent SQL injection
      const values = Object.values(filterObject);

      console.log("Executing SQL:", query, values);

      global.db.get(query + " LIMIT 5", values, (err, movie) => {
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

  global.db.all(sqlQuery, [algorithmID], (err, rows) => {
    if (err) {
      console.error("❌ Database Error:", err.message);
      return res.status(500).json({ error: "Database query error." });
    }

    if (!rows.length) {
      return res.status(404).json({ error: "No parameters found for this algorithm." });
    }

    res.json(rows);
  });
});

const { FILTER_MAPPING, searchQueryMap } = require("../util/FilterMapping");





module.exports = router;
