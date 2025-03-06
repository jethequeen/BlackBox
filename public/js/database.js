async function fetchData() {
  const response = await fetch('http://localhost:3000/data');
  const data = await response.json();

  console.log("Données reçues :", data); // Pour debug

  const tableBody = document.getElementById("data-table-body");
  if (tableBody) {
    data.forEach(row => {
      let tr = document.createElement("tr");
      tr.innerHTML = `<td>${row.id}</td><td>${row.award}</td><td>${row.acteur}</td><td>${row.genre}</td><td>${row.localDirector}</td><td>${row.filmmaker}</td>`;
      tableBody.appendChild(tr);
    });
  }
}

// Function to update the UI with movie details
function printMovie(movieDetails) {
  if (!movieDetails) {
    console.error("printMovie: No movie details provided");
    document.getElementById("movie-title").innerText = "Film non trouvé";
    return;
  }

  console.log("Affichage du film :", movieDetails);

  // Define a default poster if none exists
  const defaultPoster = "/img/default-movie-poster.jpg";
  const posterImg = movieDetails.poster && movieDetails.poster.includes("null")
    ? defaultPoster
    : movieDetails.poster;

  // Update the UI with movie details
  document.getElementById("movie-title").innerText = movieDetails.title;
  document.getElementById("movie-poster").src = posterImg;
  document.getElementById("movie-year").innerText = movieDetails.year;
  document.getElementById("movie-director").innerText = movieDetails.director;
  document.getElementById("movie-runtime").innerText = movieDetails.runtime;
  document.getElementById("movie-country").innerText = movieDetails.country;

  // Display actors
  const actorsContainer = document.getElementById("actors-container");
  actorsContainer.innerHTML = "";  // Clear previous actors

  movieDetails.actors.forEach(actor => {
    const actorDiv = document.createElement("div");
    actorDiv.classList.add("actor");

    // Check if the actor has a profile picture, otherwise use a default one
    const profileImg = actor.profilePath && !actor.profilePath.includes("null")
      ? actor.profilePath
      : "/img/Neutral-placeholder-profile-300x300.jpg";

    actorDiv.innerHTML = `
            <img src="${profileImg}" alt="${actor.name}"
                onerror="this.onerror=null;this.src='/img/Neutral-placeholder-profile-300x300.jpg';">
            <p>${actor.name}</p>
        `;
    actorsContainer.appendChild(actorDiv);
  });
}

// Function to fetch a random movie and display it
async function fetchRandomMovie() {
  try {
    const response = await fetch('/random-movie');
    if (!response.ok) {
      throw new Error(`Erreur serveur : ${response.status}`);
    }

    const movie = await response.json();
    console.log("Film reçu :", movie);

    // Fetch details from TMDb
    const movieDetails = await getMovieDetails(movie.Title);
    if (!movieDetails) {
      document.getElementById("movie-title").innerText = "Film non trouvé sur TMDb";
      return;
    }

    // Call printMovie to update UI
    printMovie(movieDetails);

  } catch (error) {
    console.error("Erreur lors de la récupération du film :", error);
    document.getElementById("movie-title").innerText = "Erreur de chargement";
  }
}

// Ensure the page loads with a random movie
document.addEventListener("DOMContentLoaded", () => {
  console.log("Page chargée, exécution de fetchRandomMovie()...");
  fetchRandomMovie();
});
