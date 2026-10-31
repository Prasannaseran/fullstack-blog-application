
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Blog = mongoose.model("Blog", blogSchema);

app.get("/", (req, res) => {
  res.send("Blog Backend Running Successfully!");
});

// Register user
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// Get all blogs
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve blogs" });
  }
});

// Get one blog by ID
app.get("/api/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(400).json({ message: "Invalid blog ID" });
  }
});

// Create blog
app.post("/api/blogs", async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({
        message: "Title, content and author are required"
      });
    }

    const blog = await Blog.create({ title, content, author });
    res.status(201).json({
      message: "Blog created successfully",
      blog
    });
  } catch (error) {
    res.status(500).json({ message: "Could not create blog" });
  }
});

const PORT = 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
