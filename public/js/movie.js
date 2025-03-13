// ✅ Fix: Define `currentMovieIndex`
let currentMovieIndex = 0;
let movieResults = [];
let debounceTimer ;

async function getSQLQuery(filters) {

  try {
    const response = await fetch("/movies/build-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters }),
    });

    if (!response.ok) {
      throw new Error(`❌ API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Generated SQL Query:", data.query, "Values:", data.values);
    return data;
  } catch (error) {
    console.error("❌ Error fetching query:", error);
    return null;
  }
}

async function fetchAlgorithmParams() {
  const selectedAlgorithmID = localStorage.getItem("selectedAlgorithmID");
  if (!selectedAlgorithmID) {
    console.error("❌ No algorithm selected.");
    return null;
  }

  try {
    const response = await fetch(`/algorithm/getAlgorithmParams?algorithmID=${selectedAlgorithmID}`);

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log("🔍 Algorithm Parameters:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching algorithm parameters:", error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const movieList = document.getElementById("movieList");
  const loadingSpinner = document.getElementById("loading-spinner");
  const loadingText = document.getElementById("loading-text");
  const movieInfo = document.getElementById("movie-info");

  try {
    loadingSpinner.classList.remove("hidden");
    loadingText.classList.remove("hidden");
    movieInfo.classList.add("hidden");

    const parameters = await fetchAlgorithmParams();
    if (!parameters) {
      movieList.innerHTML = "<p>Error loading algorithm parameters.</p>";
      return;
    }

    let filters = {};
    parameters.forEach(param => {
      filters[param.key] = param.value;
    });

    const sqlResult = await getSQLQuery(filters);
    if (!sqlResult) {
      console.error("❌ Error generating SQL query.");
      movieList.innerHTML = "<p>Error generating SQL query.</p>";
      return;
    }

    const { query, values } = sqlResult;
    console.log("🔍 Running Query:", query, "Values:", values);

    // ✅ Fetch movies from backend
    const movieResponse = await fetch("/movies/fetchMovies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, values })
    });

    if (!movieResponse.ok) {
      throw new Error(`HTTP error! Status: ${movieResponse.status}`);
    }

    const movies = await movieResponse.json();
    if (!Array.isArray(movies) || movies.length === 0) {
      movieList.innerHTML = "<p>No movies found.</p>";
      return;
    }
    movies.sort(() => Math.random() - 0.5);

    const firstMovieDetails = await getMovieDetails(movies[0].ID);
    if (firstMovieDetails) {
      printMovie(firstMovieDetails);
    }
    movieResults = movies;
    updateNavButtons();
  } catch (error) {
    console.error("❌ Error fetching movies:", error);
  } finally {
    loadingSpinner.classList.add("hidden");
    loadingText.classList.add("hidden");
    movieInfo.classList.remove("hidden");
  }
});

async function printMovie(movieDetails) {
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

  if (movieDetails.actors.length > 0) {
    movieDetails.actors.forEach(actor => {
      const actorDiv = document.createElement("div");
      actorDiv.classList.add("actor");

      actorDiv.innerHTML = `
              <img src="${actor.profilePath}" alt="${actor.name}">
              <p>${actor.name}</p>
          `;
      actorsContainer.appendChild(actorDiv);
    });
  } else {
    actorsContainer.innerHTML = "<p>No actors found.</p>";
  }
}

async function nextMovie() {
  if (currentMovieIndex < movieResults.length - 1) {
    currentMovieIndex++;
    const nextMovieDetails = await getMovieDetails(movieResults[currentMovieIndex].ID);
    if (nextMovieDetails) {
      printMovie(nextMovieDetails);
    } else {
      console.error("❌ No details found for next movie.");
    }
    updateNavButtons();
  }
}

async function prevMovie() {
  if (currentMovieIndex > 0) {
    currentMovieIndex--;
    const prevMovieDetails = await getMovieDetails(movieResults[currentMovieIndex].ID);
    if (prevMovieDetails) {
      printMovie(prevMovieDetails);
    }
    updateNavButtons();
  }
}

async function showSuggestions(inputId, searchType, suggestionsId) {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    const query = document.getElementById(inputId).value.trim();
    const selectedAward = document.getElementById("award")?.value.trim();
    if (query.length < 1) {
      document.getElementById(suggestionsId).style.display = "none";
      return;
    }

    try {
      let fetchUrl = `/movies/search-suggestions?q=${encodeURIComponent(query)}&type=${encodeURIComponent(searchType)}`;

      if (searchType === "category" && selectedAward) {
        fetchUrl += `&award=${encodeURIComponent(selectedAward)}`;
      }

      console.log(`🔍 Fetching from: ${fetchUrl}`);
      const response = await fetch(fetchUrl);

      if (!response.ok) {
        console.error(`❌ Server responded with ${response.status}`);
        document.getElementById(suggestionsId).style.display = "none";
        return;
      }
      const suggestions = await response.json();
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        document.getElementById(suggestionsId).style.display = "none";
        return;
      }

      const suggestionsContainer = document.getElementById(suggestionsId);
      suggestionsContainer.innerHTML = "";

      suggestions.forEach(suggestion => {
        let name = suggestion.AwardType || suggestion.Category || suggestion.Name || suggestion.name || suggestion.title;

        if (!name) return;

        const div = document.createElement("div");
        div.classList.add("suggestion-item");
        div.innerText = name;

        div.onclick = () => {
          document.getElementById(inputId).value = name;
          suggestionsContainer.style.display = "none";

          if (searchType === "award") {
            console.log(`🔄 Fetching categories for selected award: ${name}`);
            showSuggestions("category", "category", "suggestions-category");
          }
        };

        suggestionsContainer.appendChild(div);
      });

      suggestionsContainer.style.display = "block";
      console.log(`🎉 Suggestions for ${inputId} are now visible.`);
    } catch (error) {
      console.error("❌ Error fetching suggestions:", error);
    }
  }, 250);
}



function updateNavButtons() {
  const prevButton = document.getElementById("prev-movie");
  const nextButton = document.getElementById("next-movie");

  // Hide both buttons if there's only one or no movie
  if (movieResults.length <= 1) {
    prevButton.style.display = "none";
    nextButton.style.display = "none";
    return;
  }

  // Toggle visibility based on the current index
  prevButton.style.display = currentMovieIndex > 0 ? "block" : "none";
  nextButton.style.display = currentMovieIndex < movieResults.length - 1 ? "block" : "none";
}



document.addEventListener("click", (event) => {
  const allSuggestions = document.querySelectorAll(".suggestions-dropdown");

  allSuggestions.forEach(suggestionsContainer => {
    if (!event.target.closest(".setting-item")) {
      suggestionsContainer.style.display = "none";
    }
  });
});
