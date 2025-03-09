document.addEventListener("DOMContentLoaded", function () {
  // Exclude the navigation bar on login and signup pages
  const excludedPages = ["/login.html", "/signup.html"];
  const currentPage = window.location.pathname;

  if (!excludedPages.includes(currentPage)) {
    // ✅ Create button bar dynamically
    const buttonBar = document.createElement("div");
    buttonBar.id = "global-button-bar";
    buttonBar.innerHTML = `
      <nav class="button-bar">
        <button id="homeButton">Home</button>
        <button id="settingsButton">Settings</button>
        <button id="algorithmButton">Algorithms</button>
        <button id="logoutButton">Logout</button>
      </nav>
    `;
    document.body.prepend(buttonBar);

    // ✅ Attach event listeners to buttons
    document.getElementById("homeButton").addEventListener("click", () => {
      window.location.href = "/home.html";
    });

    document.getElementById("settingsButton").addEventListener("click", () => {
      window.location.href = "/settings.html";
    });

    document.getElementById("algorithmButton").addEventListener("click", () => {
      window.location.href = "/algorithms.html";
    });


    document.getElementById("logoutButton").addEventListener("click", () => {
      fetch("/auth/logout", { method: "POST", credentials: "include" })
        .then(() => (window.location.href = "/login.html"))
        .catch((error) => console.error("Logout failed:", error));
    });
  }
});
