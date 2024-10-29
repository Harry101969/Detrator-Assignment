import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Button, TextField, List, ListItem, Typography } from "@mui/material";

const socket = io("http://localhost:4000"); // Replace with your backend server URL

export default function Home() {
  const [username, setUsername] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [sessionID, setSessionID] = useState(null);

  useEffect(() => {
    // Fetch initial comments
    axios.get("/api/comments").then((response) => {
      setComments(response.data);
    });

    // Listen for real-time comments
    socket.on("newComment", (newComment) => {
      setComments((prevComments) => [newComment, ...prevComments]);
    });

    return () => {
      socket.off("newComment");
    };
  }, []);

  const handleLogin = async () => {
    const response = await axios.post("/api/login", { username });
    setSessionID(response.data.sessionID);
  };

  const handlePostComment = async () => {
    if (sessionID && comment) {
      await axios.post("/api/comments", { username, comment });
      setComment("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {!sessionID ? (
        <div>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={handleLogin} variant="contained" color="primary">
            Login
          </Button>
        </div>
      ) : (
        <div>
          <Typography variant="h6">Hello, {username}</Typography>
          <TextField
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <Button
            onClick={handlePostComment}
            variant="contained"
            color="primary"
          >
            Post Comment
          </Button>
        </div>
      )}
      <List>
        {comments.map((comment) => (
          <ListItem key={comment.id}>
            <Typography variant="body1">
              <strong>{comment.username}</strong>: {comment.comment}{" "}
              <em>({new Date(comment.timestamp).toLocaleString()})</em>
            </Typography>
          </ListItem>
        ))}
      </List>
    </div>
  );
}
