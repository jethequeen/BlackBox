// Get the container element where you want to display the buttons
const algorithmButtonsContainer = document.getElementById('algorithmButtonsContainer');
const newAlgorithmButton = document.getElementById('newAlgorithmButton');
newAlgorithmButton.addEventListener('click', () => {
  window.location.href = '../template.html';
})



// Function to create a button element
function createAlgorithmButton(algorithmName, algorithmId) {
  const button = document.createElement('button');
  button.textContent = algorithmName;
  button.id = `algorithmButton-${algorithmId}`; // Add a unique ID to each button
  button.addEventListener('click', () => {
    // Direction to algoConfig.id here
  });
  return button;
}

getAlgorithmsFromAccount()
  .then(algorithms => {
    if (algorithms && algorithms.length > 0) {
      algorithms.forEach(algorithm => {
        const algorithmButton = createAlgorithmButton(algorithm.name, algorithm.id);
          algorithmButtonsContainer.appendChild(algorithmButton);
      });
    }
  })
  .catch(error => {
    console.error("Error fetching algorithms:", error);
  });



