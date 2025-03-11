
async function getSQLQuery(filters) {
  try {
    const response = await fetch("/movies/build-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters }),
    });

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

  // ✅ Fetch algorithm parameters before building the query
  const parameters = await fetchAlgorithmParams();

  // ✅ Convert parameters into filters
  let filters = {};
  parameters.forEach(param => {
    filters[param.key] = param.value;
  });

  // ✅ Fetch query from backend using `/api/build-query`
  const sqlQuery = await getSQLQuery(filters);
  if (!sqlQuery) {
    movieList.innerHTML = "<p>Error generating SQL query.</p>";
    return;
  }

  console.log("🔍 Running Query:", sqlQuery.query, "Values:", sqlQuery.values);

  // ✅ Fetch movies from backend using `/movies/fetchMovies`
  try {
    const movieResponse = await fetch("/movies/fetchMovies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: sqlQuery.query, values: sqlQuery.values })
    });

    if (!movieResponse.ok) {
      throw new Error(`HTTP error! Status: ${movieResponse.status}`);
    }

    const movies = await movieResponse.json();
    if (movies.length === 0) {
      movieList.innerHTML = "<p>No movies found.</p>";
      return;
    }

    // ✅ Shuffle movies randomly
    movies.sort(() => Math.random() - 0.5);
    printMovie(movies[0]);

  } catch (error) {
    console.error("❌ Error fetching movies:", error);
  }
});

// ✅ Function to show movie details
function displayMovieDetails(movie) {
  printMovie(movie); // Calls printMovie() to display details
}

// ✅ Function to display movie details
function printMovie(movieDetails) {
  if (!movieDetails || !movieDetails.Title) {
    document.getElementById("movie-title").innerText = "Film non trouvé";
    return;
  }

  console.log("🎬 Displaying movie:", movieDetails);

  const defaultPoster = "/img/posterPlaceholder.jpg";
  const posterImg = movieDetails.poster && !movieDetails.poster.includes("null")
    ? movieDetails.poster
    : defaultPoster;

  document.getElementById("movie-title").innerText = movieDetails.Title;
  document.getElementById("movie-poster").src = posterImg;
  document.getElementById("movie-year").innerText = movieDetails.Year || "N/A";
  document.getElementById("movie-director").innerText = movieDetails.Director || "Unknown";
  document.getElementById("movie-runtime").innerText = movieDetails.Runtime || "N/A";
  document.getElementById("movie-country").innerText = movieDetails.Country || "Unknown";

  const actorsContainer = document.getElementById("actors-container");
  actorsContainer.innerHTML = "";

  movieDetails.Actors.split(",").forEach(actor => {
    const actorDiv = document.createElement("div");
    actorDiv.classList.add("actor");

    actorDiv.innerHTML = `
            <img src="/img/actorPicturePlaceholder.jpg" alt="${actor.trim()}">
            <p>${actor.trim()}</p>
        `;
    actorsContainer.appendChild(actorDiv);
  });
}


let debounceTimer;

async function showSuggestions(inputId, searchType, suggestionsId) {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    const query = document.getElementById(inputId).value.trim();
    const selectedAward = document.getElementById("award")?.value.trim(); // ✅ Get selected award

    if (query.length < 1) {
      document.getElementById(suggestionsId).style.display = "none";
      return;
    }

    try {
      let fetchUrl = `/movies/search-suggestions?q=${encodeURIComponent(query)}&type=${encodeURIComponent(searchType)}`;

      // ✅ If fetching categories, ensure the award name is passed
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

          // ✅ If award is selected, trigger category suggestions
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
  const allSuggestions = document.querySelectorAll(".suggestions-dropdown");

  allSuggestions.forEach(suggestionsContainer => {
    if (!event.target.closest(".setting-item")) {
      suggestionsContainer.style.display = "none";
    }
  });
});



