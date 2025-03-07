

const homeButton  = document.getElementById('homeButton');
const settingsButton = document.getElementById('settingsButton');
const algorithmButton = document.getElementById('algorithmButton');
const adminButton = document.getElementById('adminButton');



homeButton.addEventListener('click', () => {
  window.location.href = '../home.html';
});

settingsButton.addEventListener('click', () => {
  window.location.href = '../settings.html';
});

algorithmButton.addEventListener('click', () => {
  window.location.href = '../algorithms.html';
});


