
async function getAlgorithmsFromAccount() {
  try {
    const response = await fetch("/algorithm/getAlgorithms");

    return await response.json();
  } catch (error) {
    return [];
  }
}



function createAlgorithm() {
  const name = document.getElementById("algoName").value.trim();
  const award = document.getElementById("award").value.trim();
  const acteur = document.getElementById("acteur").value.trim();
  const genre = document.getElementById("genre").value.trim();
  const localDirector = document.getElementById("localDirector").value.trim();
  const filmmaker = document.getElementById("filmmaker").value.trim();
  const category = document.getElementById("category").value.trim();

  if (!name) {
    alert("Algorithm name is required!");
    return;
  }

  const algorithmData = {
    name,
    parameters: [
      {key: "award", value: award},
      {key: "cast", value: acteur},
      {key: "genre", value: genre},
      {key: "director", value: localDirector},
      {key: "filmmaker", value: filmmaker},
      {key: "category", value: category}
    ].filter(p => p.value)
  };

  if (algorithmData.parameters.length === 0) {
    alert("At least one parameter must be filled in!");
    return;
  }

  fetch("/algorithm/saveAlgorithm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(algorithmData),
    credentials: "include"
  })
    .then(response => response.text())
    .then(text => {
      try {
        return JSON.parse(text);
      } catch (err) {
      }
    })
    .then(data => {
      alert("Algorithm saved!");
    })
    .catch(error => {
      alert("Error saving algorithm: " + error.message);
    });

  window.location.href = "/";
}

