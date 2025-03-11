document.addEventListener("DOMContentLoaded", async () => {
  const algorithmDropdown = document.getElementById("algorithmDropdown");
  const selectedAlgorithmButton = document.getElementById("selectedAlgorithm");
  const findMovieButton = document.getElementById("findMovieButton");

  try {
    // ✅ Fetch available algorithms from the backend
    const response = await fetch("/algorithm/getAlgorithms");
    const algorithms = await response.json();

    if (algorithms.length === 0) {
      algorithmDropdown.innerHTML = "<p>No algorithms available.</p>";
      findMovieButton.style.display = "none"; // Hide button if no algorithms
      return;
    }

    // ✅ Populate the dropdown with algorithms
    algorithmDropdown.innerHTML = ""; // Clear existing items
    algorithms.forEach(algo => {
      const algoItem = document.createElement("div");
      algoItem.classList.add("dropdown-item");
      algoItem.textContent = algo.name;
      algoItem.onclick = () => {
        localStorage.setItem("selectedAlgorithmID", algo.id);
        selectedAlgorithmButton.textContent = algo.name;
        findMovieButton.style.display = "block"; // Show button when selected
      };
      algorithmDropdown.appendChild(algoItem);
    });
  } catch (error) {
    console.error("❌ Error fetching algorithms:", error);
  }

  // ✅ Redirect to movies page when "Find a movie" is clicked
  findMovieButton.addEventListener("click", () => {
    const selectedAlgorithmID = localStorage.getItem("selectedAlgorithmID");
    if (!selectedAlgorithmID) {
      alert("Please select an algorithm first!");
      return;
    }
    window.location.href = "/movie.html"; // Redirect to movie.html
  });
});
