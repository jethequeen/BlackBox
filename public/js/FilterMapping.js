
const FILTER_MAPPING = {
  director: {
    join: "JOIN FilmCrew ON Films.ID = FilmCrew.FilmID JOIN Crew ON FilmCrew.CrewTMDB_ID = Crew.TMDB_ID",
    column: "Crew.Name",
    condition: "FilmCrew.Job = 'Director'"
  },
  writer: {
    join: "JOIN FilmCrew ON Films.ID = FilmCrew.FilmID JOIN Crew ON FilmCrew.CrewTMDB_ID = Crew.TMDB_ID",
    column: "Crew.Name",
    condition: "FilmCrew.Job = 'Writer'"
  },
  award: {
    join: "JOIN FilmAwards ON Films.ID = FilmAwards.FilmID JOIN AwardCategories ON FilmAwards.ID = AwardCategories.ID",
    column: "AwardCategories.AwardType"
  },
  genre: {
    join: "JOIN FilmGenre ON Films.ID = FilmGenre.FilmID JOIN Genres ON FilmGenre.GenreID = Genres.ID",
    column: "Genres.Name"
  },
  cast: {
    join: "JOIN FilmCast ON Films.ID = FilmCast.FilmID JOIN Cast ON FilmCast.CastID = Cast.ID",
    column: "Cast.Name"
  }
};
