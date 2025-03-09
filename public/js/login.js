
document.addEventListener("DOMContentLoaded", function() {
  const loginContainer = document.getElementById("login-container");
  const signupContainer = document.getElementById("signup-container");
  const showSignup = document.getElementById("show-signup");
  const showLogin = document.getElementById("show-login");

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginError = document.getElementById("login-error");
  const signupError = document.getElementById("signup-error");

  showSignup.addEventListener("click", function(event) {
    event.preventDefault();
    loginContainer.style.display = "none";
    signupContainer.style.display = "block";
    loginContainer.classList.add("hidden");
    signupContainer.classList.remove("hidden");
  });

  showLogin.addEventListener("click", function(event) {
    event.preventDefault();
    signupContainer.style.display = "none";
    loginContainer.style.display = "block";
    signupContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  });

  // ✅ Handle Login
  loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch("auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });

    const data = await response.json();

    if (response.ok){
      window.location.href = "/";
    } else {
      console.warn("⚠️ Login failed:", data.error);
      loginError.textContent = data.error;
    }
  });

  signupForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    console.log("🔹 Sending signup request...", { username, email });

    const response = await fetch("auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const responseText = await response.text();

    try {
      const data = JSON.parse(responseText);
      if (response.ok) {
        console.log("✅ Signup successful. Redirecting to login...");
        alert("Signup successful. Please log in.");
        window.location.href = "/login.html";
      } else {
        console.warn("⚠️ Signup failed:", data.error);
        signupError.textContent = data.error;
      }
    } catch (error) {
      console.error("❌ Error parsing JSON:", error);
      signupError.textContent = "Unexpected response from the server.";
    }
  });

});
