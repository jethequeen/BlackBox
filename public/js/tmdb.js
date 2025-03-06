const TMDB_API_KEY = "3d086ca0452b6022e9f3469f336ddbf9"  // Remplace avec ta clé API
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function getMovieDetails(movieId) {
  if (!movieId) {
    console.error("❌ getMovieDetails() called with empty ID!");
    return null;
  }

  console.log("🌍 Fetching details from TMDb for ID:", movieId);

  try {
    const detailsUrl = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (!detailsData) {
      console.error("❌ No movie details found for ID:", movieId);
      return null;
    }

    console.log("✅ Movie details received:", detailsData);

    const director = detailsData.credits?.crew.find(person => person.job === "Director")?.name || "Unknown";

    // ✅ Extract up to 6 actors (fallback to placeholder if missing)
    let actors = [];
    if (detailsData.credits?.cast?.length > 0) {
      actors = detailsData.credits.cast.slice(0, 6).map(actor => ({
        name: actor.name,
        profilePath: actor.profile_path
          ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
          : "/img/actorPicturePlaceholder.jpg"
      }));
    }

    // ✅ Fill missing actor slots with placeholders if needed
    while (actors.length < 6) {
      actors.push({
        name: "Unknown Actor",
        profilePath: "/img/actorPicturePlaceholder.jpg"
      });
    }

    console.log("🎭 Actors extracted:", actors);

    const movieDetails = {
      title: detailsData.title,
      poster: detailsData.poster_path
        ? `https://image.tmdb.org/t/p/w500${detailsData.poster_path}`
        : "/img/posterPlaceholder.jpg",
      year: detailsData.release_date ? detailsData.release_date.split("-")[0] : "Unknown",
      director: director,
      runtime: detailsData.runtime || "Unknown",
      country: detailsData.production_countries?.length > 0
        ? detailsData.production_countries[0].name
        : "Unknown",
      actors: actors
    };

    console.log("✅ Final movieDetails object:", movieDetails);
    return movieDetails;
  } catch (error) {
    console.error("❌ Error fetching TMDb data:", error);
    return null;
  }
}



