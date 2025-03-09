document.addEventListener("DOMContentLoaded", function() {
  const loginContainer = document.getElementById("login-container");
  const signupContainer = document.getElementById("signup-container");
  const showSignup = document.getElementById("show-signup");
  const showLogin = document.getElementById("show-login");

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginError = document.getElementById("login-error");
  const signupError = document.getElementById("signup-error");

  if (!loginForm || !signupForm) {
    console.error("❌ Forms not found in the DOM. Check your HTML!");
    return;
  }

  // ✅ Show Signup Form
  showSignup.addEventListener("click", function(event) {
    event.preventDefault();
    loginContainer.style.display = "none";
    signupContainer.style.display = "block";
  });

  // ✅ Show Login Form
  showLogin.addEventListener("click", function(event) {
    event.preventDefault();
    signupContainer.style.display = "none";
    loginContainer.style.display = "block";
  });

  // ✅ Handle Login
  loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    console.log("🔹 Sending login request...", { username });

    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Login successful. Redirecting...");
      window.location.href = "/";
    } else {
      console.warn("⚠️ Login failed:", data.error);
      loginError.textContent = data.error;
    }
  });

  // ✅ Handle Signup
  signupForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    console.log("🔹 Sending signup request...", { username, email });

    const response = await fetch("/signup", {  // Change to `/api/signup` if needed
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Signup successful. Redirecting to login...");
      alert("Signup successful. Please log in.");
      window.location.href = "/login.html";
    } else {
      console.warn("⚠️ Signup failed:", data.error);
      signupError.textContent = data.error;
    }
  });
});
