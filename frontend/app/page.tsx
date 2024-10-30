"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Stack,
} from "@mui/material";
import { Send as SendIcon, AccountCircle } from "@mui/icons-material";

const socket = io("http://localhost:4000"); // Replace with your backend server URL

interface Comment {
  id: number;
  username: string;
  comment: string;
  timestamp: string;
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [sessionID, setSessionID] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comments`)
      .then((response) => {
        setComments(response.data);
      })
      .catch((error) => console.error("Error fetching comments:", error));

    // Listen for real-time comments
    socket.on("newComment", (newComment) => {
      setComments((prevComments) => [newComment, ...prevComments]);
    });

    return () => {
      socket.off("newComment");
    };
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`,
        { username }
      );
      setSessionID(response.data.sessionID);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handlePostComment = async () => {
    if (sessionID && comment) {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comments`,
          { username, comment }
        );
        setComment("");
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {!sessionID ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Welcome, please enter your username
            </Typography>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <AccountCircle color="primary" sx={{ mr: 1 }} />
                ),
              }}
            />
            <Button
              onClick={handleLogin}
              variant="contained"
              fullWidth
              sx={{ py: 1 }}
            >
              Login
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Hello, {username}!
            </Typography>
            <TextField
              label="Your Comment"
              multiline
              rows={3}
              variant="outlined"
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              onClick={handlePostComment}
              variant="contained"
              fullWidth
              endIcon={<SendIcon />}
              sx={{ py: 1 }}
            >
              Post Comment
            </Button>
          </Box>
        )}
      </Paper>

      <List sx={{ mt: 4 }}>
        {comments.map((comment) => (
          <Paper
            elevation={1}
            key={comment.id}
            sx={{ mb: 2, p: 2, borderRadius: 2 }}
          >
            <ListItem alignItems="flex-start">
              <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                {comment.username.charAt(0).toUpperCase()}
              </Avatar>
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {comment.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(comment.timestamp).toLocaleString()}
                    </Typography>
                  </Stack>
                }
                secondary={
                  <Typography variant="body1">{comment.comment}</Typography>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>
    </Container>
  );
}
