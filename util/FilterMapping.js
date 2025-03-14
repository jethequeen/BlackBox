const FILTER_MAPPING = {
  award: {
    join: `
      JOIN FilmAwards ON Films.ID = FilmAwards.FilmID
      JOIN AwardCategories ON FilmAwards.CategoryID = AwardCategories.ID`,
    column: "AwardCategories.AwardType",
  },

  category: {
    join: `
      JOIN FilmAwards ON Films.ID = FilmAwards.FilmID
      JOIN AwardCategories ON FilmAwards.CategoryID = AwardCategories.ID`,
    column: "AwardCategories.Category",
    condition: "FilmAwards.State = 'Winner' AND AwardCategories.AwardType = ?",
  },

  director: {
    join: `
      JOIN FilmCrew ON Films.ID = FilmCrew.FilmID
      JOIN Crew ON FilmCrew.CrewTMDB_ID = Crew.TMDB_ID`,
    column: "Crew.Name",
    condition: "FilmCrew.Job = 'Director'",
  },

  filmmaker: {
    join: `
      JOIN FilmCrew ON Films.ID = FilmCrew.FilmID
      JOIN Crew ON FilmCrew.CrewTMDB_ID = Crew.TMDB_ID`,
    column: "Crew.Name",
  },

  cast: {
    join: `
      JOIN FilmCast ON Films.ID = FilmCast.FilmID
      JOIN "Cast" ON FilmCast.CastID = "Cast".TMDB_ID`,
    column: `"Cast".Name`,
  },
};

// For the suggestions
const searchQueryMap = {
  film: "SELECT Title AS name FROM Films WHERE Title LIKE ? LIMIT 5",
  cast: "SELECT Name FROM Cast WHERE Name LIKE ? ORDER BY Popularity DESC LIMIT 5",
  crew: "SELECT Name AS name FROM Crew WHERE Name LIKE ? ORDER BY Popularity DESC LIMIT 5",
  award: "SELECT DISTINCT AwardType FROM AwardCategories WHERE AwardType LIKE ? LIMIT 5",
  genre: "SELECT Name FROM Genres WHERE Name LIKE ? LIMIT 5",
  director: "SELECT DISTINCT Crew.Name AS name FROM Crew JOIN FilmCrew ON Crew.TMDB_ID = FilmCrew.CrewTMDB_ID WHERE FilmCrew.Job = 'Director' AND Crew.Name LIKE ? LIMIT 5",
  category: `SELECT DISTINCT Category FROM AwardCategories WHERE AwardType == ?
             AND CATEGORY LIKE ? ORDER BY Category LIMIT 5`
};

module.exports = { FILTER_MAPPING, searchQueryMap };
