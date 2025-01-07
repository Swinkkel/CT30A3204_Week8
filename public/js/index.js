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
      console.log(data.message || "Login failed.");
    }
  } catch (err) {
    console.error(err);
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

      const titleSpan = document.createElement("span")
      titleSpan.classList.add("card-title")
      titleSpan.innerText = topic.title
      contentDiv.appendChild(titleSpan)

      const contentText = document.createElement("p")
      contentText.innerText = topic.content
      contentDiv.appendChild(contentText)

      const postedBy = document.createElement("p")
      postedBy.classList.add("grey-text", "text-darken-2")
      postedBy.innerText = `Posted by: ${topic.username} at ${new Date(topic.createdAt).toLocaleString()}`
      contentDiv.appendChild(postedBy)

      const deleteBtnDiv = document.createElement("div");
      deleteBtnDiv.classList.add("card-action")

      const deleteBtn = document.createElement("button")
      deleteBtn.id = "deleteTopic"
      deleteBtn.innerText = "Delete"
      deleteBtn.classList.add("btn", "waves-effect", "waves-light")
      deleteBtnDiv.appendChild(deleteBtn)

      contentDiv.appendChild(deleteBtnDiv)

      topicDiv.appendChild(contentDiv);
      topicsDiv.appendChild(topicDiv);

      deleteBtn.addEventListener("click", () => deleteTopic(topic._id));
    });
  } catch (err) {
    console.error(err);
  }
}

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
          console.log("Token defined")

          document.getElementById("topicForm").innerHTML = `
            <form id="postTopicForm">
              <div class="input-field">
                <input type="text" id="topicTitle" placeholder="Topic Title" required>
              </div>
              <div class="input-field">
                <textarea id="topicText" class="materialize-textarea" placeholder="Topic Content" required></textarea>
              </div>
              <button type="submit" id="postTopic" class="btn waves-effect waves-light">Post Topic</button>
            </form>`
          document.getElementById("topicForm").style.display = "block";
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
                console.log("Failed to post topic.");
              }
            } catch (err) {
              console.error(err);
            }
          });

        }
        else {
          console.log("No token")

          document.getElementById("topicForm").style.display = "none";
          document.getElementById("topicForm").innerHTML = "";
        }
    }
})
