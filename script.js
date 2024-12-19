
const createButton = document.querySelector('.create-button');
const prixInput = document.getElementById('prix');
const prixSuggestions = document.getElementById('suggestions-prix');

createButton.addEventListener('click', () => {
    // Construct the Google search URL
    const searchUrl = `https://www.google.com/search?q=bonjour`;

    // Open the search URL in a new tab/window
    window.open(searchUrl, '_blank');
});

prixInput.addEventListener('input', () => {
    const searchTerm = prixInput.value;

    // Envoyez une requête AJAX au serveur
    fetch(`/suggestions?q=${searchTerm}`)
        .then(response => response.json())
        .then(suggestions => {
            // Effacez les suggestions précédentes
            prixSuggestions.innerHTML = '';

            // Ajoutez les nouvelles suggestions à la liste
            suggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                li.addEventListener('click', () => {
                    prixInput.value = suggestion;
                    prixSuggestions.innerHTML = ''; // Effacez la liste après la sélection
                });
                prixSuggestions.appendChild(li);
            });
        });
});

