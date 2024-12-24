
const createButton = document.querySelector('.create-button');
const prixInput = document.getElementById('prix');
const prixSuggestions = document.getElementById('suggestions-prix');
const findMovieButton = document.getElementById('findMovieButton');
// Get references to the dropdown elements
const selectedAlgorithm = document.getElementById('selectedAlgorithm');
const algorithmDropdown = document.getElementById('algorithmDropdown');

findMovieButton.addEventListener('click', () => {
  window.location.href = '../html/movie.html';
});


// prixInput.addEventListener('input', () => {
//   const searchTerm = prixInput.value;
//
//   // Envoyez une requête AJAX au serveur
//   fetch(`/suggestions?q=${searchTerm}`)
//     .then(response => response.json())
//     .then(suggestions => {
//       // Effacez les suggestions précédentes
//       prixSuggestions.innerHTML = '';
//
//       suggestions.forEach(suggestion => {
//         const li = document.createElement('li');
//         li.textContent = suggestion;
//         li.addEventListener('click', () => {
//           prixInput.value = suggestion;
//           prixSuggestions.innerHTML = '';
//         });
//         prixSuggestions.appendChild(li);
//       });
//     });
// });



function populateAlgorithmDropdown() {
  getAlgorithmsFromAccount().then(algorithms => {
      // Clear previous dropdown items
      algorithmDropdown.innerHTML = '';

      if (algorithms && algorithms.length > 0) { // Check if algorithms exist
        // Add each algorithm to the dropdown
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
        // Handle the case where no algorithms are returned
        console.log("No algorithms found.");
        // You might want to display a message to the user or
        // disable the dropdown in this case.
      }
    })
    .catch(error => {
      console.error("Error fetching algorithms:", error);
      // Handle the error (e.g., display an error message)
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
