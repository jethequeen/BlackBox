// Get the container element where you want to display the buttons
const algorithmButtonsContainer = document.getElementById('algorithmButtonsContainer');

// Function to create a button element
function createAlgorithmButton(algorithmName, algorithmId) {
  const button = document.createElement('button');
  button.textContent = algorithmName;
  button.id = `algorithmButton-${algorithmId}`; // Add a unique ID to each button
  button.addEventListener('click', () => {
    // Handle button click (e.g., navigate to algorithm page)
    window.location.href = `algorithm.html?id=${algorithmId}`;
  });
  return button;
}

// const algorithms = getAlgorithmsFromAccount(); // This function should fetch the user's algorithms

// Always display the "Create new algorithm" button
const newAlgorithmButton = createAlgorithmButton('Create new algorithm', 'new');
algorithmButtonsContainer.appendChild(newAlgorithmButton);

// Display existing algorithms if they exist
// if (algorithms.length > 0) {
//  algorithms.forEach(algorithm => {
//    const algorithmButton = createAlgorithmButton(algorithm.name, algorithm.id);
//    algorithmButtonsContainer.appendChild(algorithmButton);
//  });
// }

newAlgorithmButton.addEventListener('click', () => {
  window.location.href = '../html/index.html';
})
