// "use client";
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import io from "socket.io-client";
// import {
//   Button,
//   TextField,
//   List,
//   ListItem,
//   Typography,
// } from "@mui/material-nextjs";

// const socket = io("http://localhost:4000"); // Replace with your backend server URL
// interface Comment {
//   id: number;
//   username: string;
//   comment: string;
//   timestamp: string;
// }
// export default function Home() {
//   const [username, setUsername] = useState("");
//   const [comment, setComment] = useState("");
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [sessionID, setSessionID] = useState<string | null>(null);

//   useEffect(() => {
//     // Fetch initial comments
//     axios
//       .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comments`)
//       .then((response) => {
//         setComments(response.data);
//       });

//     // Listen for real-time comments
//     socket.on("newComment", (newComment) => {
//       setComments((prevComments) => [newComment, ...prevComments]);
//     });

//     return () => {
//       socket.off("newComment");
//     };
//   }, []);

//   const handleLogin = async () => {
//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`,
//       { username }
//     );
//     setSessionID(response.data.sessionID);
//   };

//   const handlePostComment = async () => {
//     if (sessionID && comment) {
//       await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comments`, {
//         username,
//         comment,
//       });
//       setComment("");
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       {!sessionID ? (
//         <div>
//           <TextField
//             label="Username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           />
//           <Button onClick={handleLogin} variant="contained" color="primary">
//             Login
//           </Button>
//         </div>
//       ) : (
//         <div>
//           <Typography variant="h6">Hello, {username}</Typography>
//           <TextField
//             label="Comment"
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             style={{ width: "100%", marginBottom: "10px" }}
//           />
//           <Button
//             onClick={handlePostComment}
//             variant="contained"
//             color="primary"
//           >
//             Post Comment
//           </Button>
//         </div>
//       )}
//       <List>
//         {comments.map((comment) => (
//           <ListItem key={comment.id}>
//             <Typography variant="body1">
//               <strong>{comment.username}</strong>: {comment.comment}{" "}
//               <em>({new Date(comment.timestamp).toLocaleString()})</em>
//             </Typography>
//           </ListItem>
//         ))}
//       </List>
//     </div>
//   );
// }
"use client";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

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
    // Fetch initial comments
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comments`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setComments(data);
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setSessionID(data.sessionID);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handlePostComment = async () => {
    if (sessionID && comment) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, comment }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        setComment("");
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      {!sessionID ? (
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Username:
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mb-3"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Hello, {username}
          </h2>
          <textarea
            placeholder="Enter your comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mb-3"
          />
          <button
            onClick={handlePostComment}
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300"
          >
            Post Comment
          </button>
        </div>
      )}
      <ul className="space-y-3">
        {comments.map((comment) => (
          <li key={comment.id} className="border-b border-gray-200 pb-2">
            <strong className="text-gray-800">{comment.username}</strong>:{" "}
            {comment.comment}
            <span className="block text-sm text-gray-500">
              {new Date(comment.timestamp).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
