const { FILTER_MAPPING } = require("./FilterMapping");

function buildQuery(filters, accountID) {

  let queries = [];
  let values = [];

  if (filters.award && filters.category) {
    queries.push(`
      SELECT Films.ID, Films.Title, Films.Year
      FROM Films
             JOIN FilmAwards ON Films.ID = FilmAwards.FilmID
      WHERE FilmAwards.State = 'winner'
        AND EXISTS (
        SELECT 1 FROM AwardCategories
        WHERE AwardCategories.ID = FilmAwards.CategoryID
          AND AwardCategories.AwardType = ?
          AND AwardCategories.Category = ?
      )
        AND Films.ID NOT IN (SELECT TMDB_ID FROM FilmsWatched WHERE AccountID = ?)
    `);
    values.push(filters.award, filters.category, accountID);
  }

  for (const [key, value] of Object.entries(filters)) {
    if (!FILTER_MAPPING[key] || key === "award" || key === "category") continue;

    const { join, column, condition } = FILTER_MAPPING[key];
    let whereClause = `${column} = ?`;
    if (condition) whereClause = `(${condition} AND ${whereClause})`;

    queries.push(`
      SELECT Films.ID, Films.Title, Films.Year
      FROM Films
             ${join}
      WHERE ${whereClause}
        AND Films.ID NOT IN (SELECT TMDB_ID FROM FilmsWatched WHERE AccountID = ?)
    `);
    values.push(value, accountID);
  }

  if (queries.length === 0) {
    return { query: "", values: [] };
  }

  let finalQuery = `
    SELECT DISTINCT Films.ID, Films.Title, Films.Year
    FROM (
           ${queries.join(" UNION ")}
           ) AS Films
    ORDER BY RANDOM()`;

  return { query: finalQuery, values };
}

module.exports = { buildQuery };
