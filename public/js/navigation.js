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
      fetch("/auth/logout", {
        method: "POST",
        credentials: "include" // Ensures cookies are sent with the request
      })
        .then(response => response.json()) // Convert response to JSON
        .then(data => {
          console.log("✅ Logout successful:", data.message);

          // Clear localStorage
          localStorage.clear(); // Clears all localStorage data
          sessionStorage.clear(); // Also clear sessionStorage if needed

          // Redirect to login page
          window.location.href = data.redirect;
        })
        .catch(error => console.error("❌ Logout failed:", error));
    });
  }
});
