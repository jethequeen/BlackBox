document.addEventListener("DOMContentLoaded", async () => {
  const algorithmDropdown = document.getElementById("algorithmDropdown");
  const selectedAlgorithmButton = document.getElementById("selectedAlgorithm");
  const findMovieButton = document.getElementById("findMovieButton");
  let algorithmName = localStorage.getItem('selectedAlgorithmName');

  if (algorithmName == null) {
    document.getElementById("selectedAlgorithm").textContent = "No Algorithm Selected"
  } else {
    document.getElementById("selectedAlgorithm").textContent = algorithmName ;
  }

  try {
    const response = await fetch("/algorithm/getAlgorithms");
    const algorithms = await response.json();

    if (algorithms.length === 0) {
      algorithmDropdown.innerHTML = "<p>No algorithms available.</p>";
      return;
    }

    algorithmDropdown.innerHTML = "";
    algorithms.forEach(algo => {
      const algoItem = document.createElement("div");
      algoItem.classList.add("dropdown-item");
      algoItem.textContent = algo.name;
      algoItem.onclick = () => {
        localStorage.setItem("selectedAlgorithmID", algo.id);
        localStorage.setItem("selectedAlgorithmName", algo.name);
        selectedAlgorithmButton.textContent = algo.name;
        findMovieButton.style.display = "block";
        algorithmDropdown.style.display = "none";
      };
      algorithmDropdown.appendChild(algoItem);
    });
  } catch (error) {
    console.error("Error fetching algorithms:", error);
  }

  findMovieButton.addEventListener("click", () => {
    const selectedAlgorithmID = localStorage.getItem("selectedAlgorithmID");
    if (!selectedAlgorithmID) {
      alert("Please select an algorithm first!");
      return;
    }
    window.location.href = "/movie.html";
  });
});
