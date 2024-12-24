function getAlgorithmsFromAccount() {
  // Simulate fetching algorithms (replace with your actual logic)
  return new Promise(resolve => {
    setTimeout(() => {
      const algorithms = [
        { id: 1, name: 'Algorithm 1' },
        { id: 2, name: 'Algorithm 2' },
        { id: 3, name: 'Algorithm 3' }
      ];
      resolve(algorithms);
    }, 50); // Simulate a 500ms delay
  });
}

function getSelectedAlgorithm() {
  // For example, you might get it from local storage:
  const selectedAlgorithmId = localStorage.getItem('selectedAlgorithm');
  return 1
}

// Function to set the selected algorithm (replace with your logic)
function setSelectedAlgorithm(algorithmId) {
  // For example, you might store it in local storage:
  localStorage.setItem('selectedAlgorithm', algorithmId);
}

