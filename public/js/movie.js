

function printMovie(movieDetails) {
  if (!movieDetails || !movieDetails.title) {
    document.getElementById("movie-title").innerText = "Film non trouvé";
    return;
  }

  console.log("🎬 Displaying movie:", movieDetails);

  const defaultPoster = "/img/posterPlaceholder.jpg";
  const posterImg = movieDetails.poster && !movieDetails.poster.includes("null")
    ? movieDetails.poster
    : defaultPoster;

  document.getElementById("movie-title").innerText = movieDetails.title;
  document.getElementById("movie-poster").src = posterImg;
  document.getElementById("movie-year").innerText = movieDetails.year || "N/A";
  document.getElementById("movie-director").innerText = movieDetails.director || "Unknown";
  document.getElementById("movie-runtime").innerText = movieDetails.runtime || "N/A";
  document.getElementById("movie-country").innerText = movieDetails.country || "Unknown";

  const actorsContainer = document.getElementById("actors-container");
  actorsContainer.innerHTML = "";


  movieDetails.actors.forEach(actor => {
    const actorDiv = document.createElement("div");
    actorDiv.classList.add("actor");

    const profileImg = actor.profilePath && !actor.profilePath.includes("null")
      ? actor.profilePath
      : "/img/actorPicturePlaceholder.jpg";

    actorDiv.innerHTML = `
            <img src="${profileImg}" alt="${actor.name}"
                onerror="this.onerror=null;this.src='/img/actorPicturePlaceholder.jpg';">
            <p>${actor.name}</p>
        `;
    actorsContainer.appendChild(actorDiv);
  });
}

async function fetchRandomMovie() {
  try {

    const response = await fetch("/movies/random-movie");

    const movie = await response.json();
    const movieDetails = await getMovieDetails(movie.ID);
    currentMovieIndex = 0;
    movieResults = movie;

    printMovie(movieDetails);
    updateNavButtons();
  } catch (error) {
    console.error("Error fetching movie:", error);
    document.getElementById("movie-title").innerText = "Error loading movie";
  }
}

async function searchMovie() {
  const role = document.getElementById("role-selector").value;
  const query = document.getElementById("search-bar").value.trim();
  if (!query) {
    console.warn("No search query entered.");
    return;
  }

  try {
    const response = await fetch(
      `movies/search-movie?q=${encodeURIComponent(query)}&role=${role}`);
    if (!response.ok) {
      if (response.status === 404) {
        alert("No movies found for this search.");
        return;
      }
    }

    movieResults = await response.json();
    if (movieResults.length === 0) {
      alert("No matching movies found.");
      return;
    }

    currentMovieIndex = 0;
    const firstMovie = movieResults[currentMovieIndex];

    if (!firstMovie || !firstMovie.Title) {
      console.error("First movie is invalid:", firstMovie);
      document.getElementById("movie-title").innerText = "Erreur de chargement";
      return;
    }

    const movieDetails = await getMovieDetails(firstMovie.ID);
    if (!movieDetails) {
      document.getElementById("movie-title").innerText = "Film non trouvé sur TMDb";
      return;
    }

    printMovie(movieDetails);
    updateNavButtons();

  } catch (error) {
    console.error("Error fetching searched movie:", error);
    document.getElementById("movie-title").innerText = "Erreur de chargement";
  }
}

let debounceTimer;

async function showSuggestions() {
  clearTimeout(debounceTimer); // Clear the previous timer

  debounceTimer = setTimeout(async () => {
    const query = document.getElementById("search-bar").value.trim();
    if (query.length < 4) return (document.getElementById("suggestions").style.display = "none");

    try {
      const response = await fetch(`/movies/search-suggestions?q=${encodeURIComponent(query)}`);
      const suggestions = await response.json();
      const suggestionsContainer = document.getElementById("suggestions");
      suggestionsContainer.innerHTML = "";

      if (suggestions.length === 0) {
        suggestionsContainer.style.display = "none";
        return;
      }

      suggestions.forEach(suggestion => {
        const div = document.createElement("div");
        div.classList.add("suggestion-item");
        div.innerText = suggestion;
        div.onclick = () => {
          document.getElementById("search-bar").value = suggestion;
          suggestionsContainer.style.display = "none";
          searchMovie();
        };
        suggestionsContainer.appendChild(div);
      });

      suggestionsContainer.style.display = "block";
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, 250);
}

function updateNavButtons() {
  const prevButton = document.getElementById("prev-movie");
  const nextButton = document.getElementById("next-movie");

  if (movieResults.length <= 1) {
    prevButton.classList.add("hidden");
    nextButton.classList.add("hidden");
  } else {
    prevButton.classList.remove("hidden");
    nextButton.classList.remove("hidden");

    if (currentMovieIndex === 0) {
      prevButton.classList.add("hidden");
    }
    if (currentMovieIndex === movieResults.length - 1) {
      nextButton.classList.add("hidden");
    }
  }
}

function nextMovie() {
  if (currentMovieIndex < movieResults.length - 1) {
    currentMovieIndex++;
    getMovieDetails(movieResults[currentMovieIndex].ID).then(printMovie);
    updateNavButtons();
  }
}

function prevMovie() {
  if (currentMovieIndex > 0) {
    currentMovieIndex--;
    getMovieDetails(movieResults[currentMovieIndex].ID).then(printMovie);
    updateNavButtons();
  }
}

document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-container")) {
    document.getElementById("suggestions").style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("Page chargée, exécution de fetchRandomMovie()...");
  fetchRandomMovie();
});

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-bar");
  const suggestionsContainer = document.getElementById("suggestions");

  document.getElementById("suggestions").addEventListener("click", function (event) {
    if (event.target.classList.contains("suggestion-item")) {
      searchInput.value = event.target.innerText;
      suggestionsContainer.style.display = "none";
    }
  });
});
