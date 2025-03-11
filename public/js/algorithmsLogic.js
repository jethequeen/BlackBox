function getAlgorithmsFromAccount() {
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
  const selectedAlgorithmId = localStorage.getItem('selectedAlgorithm');
  return 1
}

function setSelectedAlgorithm(algorithmId) {
  localStorage.setItem('selectedAlgorithm', algorithmId);
}

function buildQuery(filters) {
  let baseQuery = "SELECT DISTINCT Films.* FROM Films";
  let joins = new Set();
  let conditions = [];

  for (const [key, value] of Object.entries(filters)) {
    if (FILTER_MAPPING[key]) {
      const { join, column, condition } = FILTER_MAPPING[key];

      joins.add(join);

      let conditionStr = `${column} = ?`;
      if (condition) conditionStr = `(${condition} AND ${conditionStr})`;

      conditions.push(conditionStr);
    }
  }

  let query = baseQuery;
  if (joins.size > 0) query += " " + Array.from(joins).join(" ");
  if (conditions.length > 0) query += " WHERE " + conditions.join(" OR ");

  return query;
}

function createAlgorithm() {
  const name = document.getElementById("algoName").value.trim();
  const award = document.getElementById("award").value.trim();
  const acteur = document.getElementById("acteur").value.trim();
  const genre = document.getElementById("genre").value.trim();
  const localDirector = document.getElementById("localDirector").value.trim();
  const filmmaker = document.getElementById("filmmaker").value.trim();

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
      {key: "filmmaker", value: filmmaker}
    ].filter(p => p.value)
  };

  if (algorithmData.parameters.length === 0) {
    alert("At least one parameter must be filled in!");
    return;
  }

  console.log("🔹 Sending JSON Data:", JSON.stringify(algorithmData, null, 2));


  fetch("/algorithm/saveAlgorithm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(algorithmData),
    credentials: "include"
  })
    .then(response => response.text()) // Log raw response to debug issues
    .then(text => {
      console.log("🔹 Raw Response:", text);
      try {
        return JSON.parse(text);
      } catch (err) {
        throw new Error("Invalid JSON received from server");
      }
    })
    .then(data => {
      console.log("✅ Server Response:", data);
      alert("Algorithm saved!");
    })
    .catch(error => {
      console.error("❌ Error:", error.message);
      alert("Error saving algorithm: " + error.message);
    });
}

