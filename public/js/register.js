const API_URL = "http://localhost:3000/api";

// Register a new user
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const isAdmin = document.getElementById("isAdmin").checked;

  try {
    const res = await fetch(`${API_URL}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, isAdmin }),
    });

    if (res.ok) {
      alert("Registration successful!");
      window.location.href = "/index.html";
    } else {
      alert("Registration failed.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error.");
  }
});