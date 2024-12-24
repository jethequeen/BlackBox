
const createButton = document.querySelector('.create-button');
const prixInput = document.getElementById('prix');
const prixSuggestions = document.getElementById('suggestions-prix');
const findMovieButton = document.getElementById('findMovieButton');

findMovieButton.addEventListener('click', () => {
  window.location.href = 'index.html';
});


prixInput.addEventListener('input', () => {
  const searchTerm = prixInput.value;

  // Envoyez une requête AJAX au serveur
  fetch(`/suggestions?q=${searchTerm}`)
    .then(response => response.json())
    .then(suggestions => {
      // Effacez les suggestions précédentes
      prixSuggestions.innerHTML = '';

      suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        li.addEventListener('click', () => {
          prixInput.value = suggestion;
          prixSuggestions.innerHTML = '';
        });
        prixSuggestions.appendChild(li);
      });
    });
});
