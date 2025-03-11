
const createButton = document.querySelector('.create-button');
const prixInput = document.getElementById('prix');
const prixSuggestions = document.getElementById('suggestions-prix');
const findMovieButton = document.getElementById('findMovieButton');
// Get references to the dropdown elements
const selectedAlgorithm = document.getElementById('selectedAlgorithm');
const algorithmDropdown = document.getElementById('algorithmDropdown');

findMovieButton.addEventListener('click', () => {
  window.location.href = '../movie.html';
});


function populateAlgorithmDropdown() {
  getAlgorithmsFromAccount().then(algorithms => {
      algorithmDropdown.innerHTML = '';

      if (algorithms && algorithms.length > 0) {
        algorithms.forEach(algorithm => {
          const algorithmItem = document.createElement('a');
          algorithmItem.textContent = algorithm.name;
          algorithmItem.href = '#';
          algorithmItem.addEventListener('click', () => {
            setSelectedAlgorithm(algorithm.id);
            selectedAlgorithm.textContent = algorithm.name;
          });
          algorithmDropdown.appendChild(algorithmItem);
        });
      } else {
        console.log("No algorithms found.");
      }
    })
    .catch(error => {
      console.error("Error fetching algorithms:", error);
    });
}

// Initial setup
populateAlgorithmDropdown();

// Display the currently selected algorithm
const currentAlgorithmId = getSelectedAlgorithm();

// Make sure getAlgorithmsFromAccount() returns an array before using .find()
getAlgorithmsFromAccount().then(algorithms => {
  if (currentAlgorithmId && algorithms && algorithms.length > 0) {
    const currentAlgorithm = algorithms.find(algo => algo.id === currentAlgorithmId);
    if (currentAlgorithm) {
      selectedAlgorithm.textContent = currentAlgorithm.name;
      findMovieButton.style.display = 'block';
    }
  } else {
    findMovieButton.style.display = 'none';
  }
})
  .catch(error => {
    console.error("Error fetching algorithms:", error);
    // Handle the error (e.g., display an error message)
  });

// For mobile use, i think
algorithmDropdown.addEventListener('click', () => {
  algorithmDropdown.classList.toggle('active');

  if (algorithmDropdown.classList.contains('active')) {
    findMovieButton.style.opacity = 1;
  } else {
    findMovieButton.style.opacity = 1;
  }
});
