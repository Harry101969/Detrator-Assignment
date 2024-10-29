import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:4000"); // Replace with your backend server URL

interface Comment {
  id: number;
  username: string;
  comment: string;
  timestamp: string;
}
interface DashboardProps {
  username: string; // Accept username as a prop
}
const apiUrl = "http://localhost:4000";

export default function Dashboard({ username }: DashboardProps) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    // Fetch initial comments
    axios
      .get(`${apiUrl}/api/comments`)
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

  const handlePostComment = async () => {
    if (comment) {
      try {
        await axios.post(`${apiUrl}/api/comments`, { username, comment });
        setComment(""); // Clear the comment input
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
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
