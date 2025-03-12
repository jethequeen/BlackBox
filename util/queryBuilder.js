const { FILTER_MAPPING } = require("./FilterMapping");

function buildQuery(filters) {
  let queries = [];
  let values = [];


  if (filters.award && filters.category) {

    queries.push(`
      SELECT Films.ID, Films.Title, Films.Year, RANDOM() as sort_order
      FROM Films
      JOIN FilmAwards ON Films.ID = FilmAwards.FilmID
      WHERE FilmAwards.State = 'winner'
        AND EXISTS (
          SELECT 1 FROM AwardCategories
          WHERE AwardCategories.ID = FilmAwards.CategoryID
            AND AwardCategories.AwardType = ?
            AND AwardCategories.Category = ?
        )
    `);
    values.push(filters.award, filters.category);
  }

  for (const [key, value] of Object.entries(filters)) {
    if (!FILTER_MAPPING[key] || key === "award" || key === "category") continue; // Award & Category already handled

    console.log(`✅ Applying Filter for ${key}:`, value);
    const { join, column, condition } = FILTER_MAPPING[key];

    let whereClause = `${column} = ?`;
    if (condition) whereClause = `(${condition} AND ${whereClause})`;

    queries.push(`
      SELECT Films.ID, Films.Title, Films.Year, RANDOM() as sort_order
      FROM Films
      ${join}
      WHERE ${whereClause}
    `);
    values.push(value);
  }

  if (queries.length === 0) {
    console.log("⚠️ No filters applied. Returning empty query.");
    return { query: "", values: [] };
  }

  // ✅ Combine Queries with UNION
  let finalQuery = queries.join(" UNION ") + " ORDER BY sort_order";

  console.log("📜 Final Query to Execute:");
  console.log(finalQuery);
  console.log("📌 Query Values:", values);

  return { query: finalQuery, values };
}

module.exports = { buildQuery };
