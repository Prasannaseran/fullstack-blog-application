const API_BASE = "http://localhost:5000";

// ---------- LOGIN ----------
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorMsg = document.getElementById("errorMsg");
    errorMsg.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.message || "Login failed";
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "dashboard.html";

    } catch (error) {
      errorMsg.textContent = "Server connection failed!";
    }
  });
}

// ---------- SIGNUP ----------
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorMsg = document.getElementById("errorMsg");
    errorMsg.textContent = "";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.message || "Registration failed";
        return;
      }

      alert("Registration successful! Please login.");
      window.location.href = "index.html";

    } catch (error) {
      errorMsg.textContent = "Server connection failed!";
    }
  });
}

// ---------- DASHBOARD ----------
const welcomeMsg = document.getElementById("welcomeMsg");

if (welcomeMsg) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    window.location.href = "index.html";
  } else {
    welcomeMsg.textContent = `Hello, ${user.name}! Welcome to your Blog Dashboard.`;
  }

  // CREATE BLOG
  const createBlogForm = document.getElementById("createBlogForm");

  if (createBlogForm && user) {
    createBlogForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const blogMessage = document.getElementById("blogMessage");
      blogMessage.textContent = "";

      const title = document.getElementById("blogTitle").value.trim();
      const content = document.getElementById("blogContent").value.trim();

      try {
        const res = await fetch(`${API_BASE}/api/blogs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            author: user.name
          })
        });

        const data = await res.json();

        if (!res.ok) {
          blogMessage.textContent = data.message || "Could not create blog";
          return;
        }

        blogMessage.style.color = "green";
        blogMessage.textContent = "Blog created successfully!";
        createBlogForm.reset();

        loadBlogs();

      } catch (error) {
        blogMessage.style.color = "red";
        blogMessage.textContent = "Server connection failed!";
      }
    });
  }

  // LOAD ALL BLOGS
  async function loadBlogs() {
    const blogsList = document.getElementById("blogsList");

    try {
      const res = await fetch(`${API_BASE}/api/blogs`);
      const blogs = await res.json();

      if (!res.ok) {
        blogsList.textContent = "Could not load blogs.";
        return;
      }

      blogsList.innerHTML = "";

      if (blogs.length === 0) {
        blogsList.textContent = "No blogs available yet.";
        return;
      }

      blogs.forEach((blog) => {
        const card = document.createElement("div");
        card.style.textAlign = "left";
        card.style.padding = "15px";
        card.style.marginBottom = "15px";
        card.style.border = "1px solid #ddd";
        card.style.borderRadius = "8px";

        const heading = document.createElement("h3");
        heading.textContent = blog.title;

        const paragraph = document.createElement("p");
        paragraph.textContent = blog.content;
        paragraph.style.marginTop = "10px";

        const author = document.createElement("small");
        author.textContent = `By: ${blog.author}`;

        card.appendChild(heading);
        card.appendChild(paragraph);
        card.appendChild(author);

        blogsList.appendChild(card);
      });

    } catch (error) {
      blogsList.textContent = "Unable to connect to server.";
    }
  }

  loadBlogs();

  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });
  }
}