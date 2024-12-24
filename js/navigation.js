

const homeButton  = document.getElementById('homeButton');
const settingsButton = document.getElementById('settingsButton');
const algorithmButton = document.getElementById('algorithmButton');



homeButton.addEventListener('click', () => {
  window.location.href = '../html/home.html';
});

settingsButton.addEventListener('click', () => {
  window.location.href = '../html/settings.html';
});

algorithmButton.addEventListener('click', () => {
  window.location.href = '../html/algorithms.html';
});
