const express = require("express");
const mysql = require("mysql2");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust this to your frontend URL in production
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());

// MySQL Connection - Update this with your Aiven credentials
const db = mysql.createConnection({
  host: "mysql-3b9a517d-gendrybaratheon780-6fe4.e.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_KRYj3-Gr42xhmgoXFaM", // Replace with the actual password from Aiven
  database: "defaultdb",
  port: 23196,
  ssl: {
    ca: fs.readFileSync("./aiven-ca.pem"),
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
app.get("/",(req,res)=>{
    res.send("Backend Server Is Up!")
})
// API for logging in (dummy login for demo purposes)
app.post("/api/login", (req, res) => {
  const { username } = req.body;
  const sessionID = Math.random().toString(36).substring(2);
  res.json({ sessionID, username });
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
