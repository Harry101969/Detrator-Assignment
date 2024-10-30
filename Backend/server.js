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
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
  })
);
app.use(bodyParser.json());
dotenv.config();

const db = mysql.createConnection({
  host: process.env.HOST_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "defaultdb",
  port: 23196,
  ssl: {
    rejectUnauthorized: false,
  },
});

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

app.post("/api/login", (req, res) => {
  const { username } = req.body;
  const sessionID = Math.random().toString(36).substring(2);
  res.json({ sessionID, username });
});

app.get("/api/comments", (req, res) => {
  const query = "SELECT * FROM comments ORDER BY timestamp DESC";
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post("/api/comments", (req, res) => {
  const { username, comment } = req.body;
  const query = "INSERT INTO comments (username, comment) VALUES (?, ?)";
  db.query(query, [username, comment], (err, result) => {
    if (err) throw err;
    io.emit("newComment", {
      id: result.insertId,
      username,
      comment,
      timestamp: new Date(),
    });
    res.json({ id: result.insertId, username, comment, timestamp: new Date() });
  });
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
