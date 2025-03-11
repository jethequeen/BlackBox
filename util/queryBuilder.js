const {FILTER_MAPPING} = require("./FilterMapping");

function buildQuery(filters) {
  let baseQuery = `
    SELECT DISTINCT Films.ID, Films.Title, Films.Year
    FROM Films
  `;

  let joins = new Set();
  let conditions = [];
  let values = [];

  if (filters.award && filters.category) {
    joins.add(`
      JOIN FilmAwards ON Films.ID = FilmAwards.FilmID
      JOIN AwardCategories ON FilmAwards.CategoryID = AwardCategories.ID
    `);
    // Fix incorrect OR by grouping with parentheses
    conditions.push(`
      (FilmAwards.State = 'winner'
      AND FilmAwards.CategoryID = (
        SELECT ID FROM AwardCategories
        WHERE AwardType = ?
          AND Category = ?
      ))
    `);
    values.push(filters.award, filters.category);
  }

  if (filters.director) {
    joins.add(`
      JOIN FilmCrew ON Films.ID = FilmCrew.FilmID
      JOIN Crew ON FilmCrew.CrewTMDB_ID = Crew.TMDB_ID
    `);
    conditions.push("Crew.Name = ?");
    values.push(filters.director);
  }

  if (filters.cast) {
    joins.add(`
      JOIN FilmCast ON Films.ID = FilmCast.FilmID
      JOIN "Cast" ON FilmCast.CastID = "Cast".TMDB_ID
    `);
    conditions.push('"Cast".Name = ?');
    values.push(filters.cast);
  }

  if (joins.size > 0) baseQuery += " " + Array.from(joins).join(" ");
  if (conditions.length > 0) baseQuery += " WHERE " + conditions.join(" OR ");

  return { query: baseQuery, values };
}

module.exports = { buildQuery };
