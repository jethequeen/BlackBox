const TMDB_API_KEY = "3d086ca0452b6022e9f3469f336ddbf9"  // Remplace avec ta clé API
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function getMovieDetails(title) {
  try {
    const searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      throw new Error("Film non trouvé sur TMDb");
    }

    const movie = searchData.results[0];
    const movieId = movie.id;

    const detailsUrl = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    const director = detailsData.credits.crew.find(person => person.job === "Director")?.name || "Inconnu";
    const actors = detailsData.credits.cast.slice(0, 5).map(actor => ({
      name: actor.name,
      profilePath: actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : "https://via.placeholder.com/100"
    }));

    return {
      title: detailsData.title,
      poster: `https://image.tmdb.org/t/p/w500${detailsData.poster_path}`,
      year: detailsData.release_date ? detailsData.release_date.split("-")[0] : "Inconnu",
      director: director,
      runtime: detailsData.runtime || "Inconnu",
      country: detailsData.production_countries.length > 0 ? detailsData.production_countries[0].name : "Inconnu",
      actors: actors
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du film :", error);
    return null;
  }
}
