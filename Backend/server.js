const express = require("express");
const mysql = require("mysql2");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const server = http.createServer(app);
const dotenv = require("dotenv");
const cors = require("cors");
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"], // Allow both frontend URLs
    methods: ["GET", "POST"],
    credentials: true, // If you need to allow credentials (cookies, authorization headers, etc.)
  },
});
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:3001",
    ],
    origin: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
  })
);
app.use(bodyParser.json());
dotenv.config();
// MySQL Connection - Update this with your Aiven credentials
const db = mysql.createConnection({
  host: process.env.HOST_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Replace with the actual password from Aiven
  database: "defaultdb",
  port: 23196,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Check the MySQL connection
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to Aiven MySQL Database.");
});
app.get("/", (req, res) => {
  res.send("Backend Server Is Up!");
});
// API for logging in (dummy login for demo purposes)
app.post("/api/login", (req, res) => {
  const { username } = req.body;
  const sessionID = Math.random().toString(36).substring(2);
  res.json({ sessionID, username });
  console.log(sessionID);
});
// API to fetch comments
app.get("/api/comments", (req, res) => {
  const query = "SELECT * FROM comments ORDER BY timestamp DESC";
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// API to post a new comment
app.post("/api/comments", (req, res) => {
  const { username, comment } = req.body;
  const query = "INSERT INTO comments (username, comment) VALUES (?, ?)";
  db.query(query, [username, comment], (err, result) => {
    if (err) throw err;

    // Emit the new comment via Socket.IO
    io.emit("newComment", {
      id: result.insertId,
      username,
      comment,
      timestamp: new Date(),
    });
    res.json({ id: result.insertId, username, comment, timestamp: new Date() });
  });
});

// Real-time comments with Socket.IO
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
