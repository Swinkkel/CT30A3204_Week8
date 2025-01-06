const API_URL = "http://localhost:3000/api";

// Login and store token
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_URL}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      window.location.reload();
    } else {
      alert(data.message || "Login failed.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error.");
  }
});

// Fetch topics
async function fetchTopics() {
  const topicsDiv = document.getElementById("topics");
  topicsDiv.innerHTML = "";

  try {
    const res = await fetch(`${API_URL}/topics`);
    const topics = await res.json();

    topics.forEach((topic) => {
      const topicDiv = document.createElement("div");
      topicDiv.classList.add("card", "z-depth-2", "hoverable", "grey", "lighten-2")

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("card-content")

      contentDiv.innerHTML = `
        <span>${topic.title}</span>
        <p>${topic.content}</p>
        <p class="grey-text text-darken-2">Posted by: ${topic.username} at ${new Date(topic.createdAt).toLocaleString()}</p>
        <div class="card-action">
          <button id="deleteTopic" class="btn waves-effect waves-light">Delete</button>
        </div>
      `;
      topicsDiv.appendChild(topicDiv);

      document.getElementById(`deleteTopic-${topic._id}`)?.addEventListener("click", () => deleteTopic(topic._id));
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load topics.");
  }
}

// Post a new topic
document.getElementById("postTopicForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const title = document.getElementById("topicTitle").value.trim();
  const content = document.getElementById("topicText").value.trim();

  try {
    const res = await fetch(`${API_URL}/topic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    if (res.ok) {
      fetchTopics();
    } else {
      alert("Failed to post topic.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error.");
  }
});

// Delete a topic
async function deleteTopic(id) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/topic/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      fetchTopics();
    } else {
      alert(data.message || "Failed to delete topic.");
    }
  } catch (err) {
    console.error(err);
  }
}

// On page load
document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname || '/';
  
    if (currentPath === '/' || currentPath === '/index.html') {
        fetchTopics();

        const token = localStorage.getItem("token");
        if (token) {
            document.getElementById("topicForm").style.display = "block";
        }
    }
})
