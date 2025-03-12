const FILTER_MAPPING = {
  award: {
    join: `
      JOIN FilmAwards ON Films.ID = FilmAwards.FilmID
      JOIN AwardCategories ON FilmAwards.CategoryID = AwardCategories.ID
    `,
    column: "AwardCategories.AwardType",
  },

  category: {
    join: `
      JOIN FilmAwards ON Films.ID = FilmAwards.FilmID
      JOIN AwardCategories ON FilmAwards.CategoryID = AwardCategories.ID
    `,
    column: "AwardCategories.Category",
    condition: "FilmAwards.State = 'Winner' AND AwardCategories.AwardType = ?",
  },

  director: {
    join: `
      JOIN FilmCrew ON Films.ID = FilmCrew.FilmID
      JOIN Crew ON FilmCrew.CrewTMDB_ID = Crew.TMDB_ID
    `,
    column: "Crew.Name",
    condition: "FilmCrew.Job = 'Director'",
  },

  filmmaker: {
    join: `
      JOIN FilmCrew ON Films.ID = FilmCrew.FilmID
      JOIN Crew ON FilmCrew.CrewTMDB_ID = Crew.TMDB_ID
    `,
    column: "Crew.Name",
  },

  cast: {
    join: `
      JOIN FilmCast ON Films.ID = FilmCast.FilmID
      JOIN "Cast" ON FilmCast.CastID = "Cast".TMDB_ID
    `,
    column: `"Cast".Name`,
  },
};

module.exports = { FILTER_MAPPING };
