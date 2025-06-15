import React, { useEffect, useState } from "react";
import axios from "axios";
import './feedpage.css';
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Feed() {
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/feed");
      setPosts(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again.");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() && !image) return;
    if (!user) {
      setError("You must be logged in to post");
      return;
    }

    const displayName = user.displayName || user.email?.split('@')[0] || "Anonymous User";

    const formData = new FormData();
  if(newPost.trim()) formData.append("content", newPost);
  formData.append("uid", user.uid);
  formData.append("name", displayName);
  if (image) formData.append("image", image);
  console.log([...formData.entries()]);

  try {
    await axios.post("http://localhost:5000/api/feed", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

      setNewPost('');
      setImage(null);
      await fetchPosts();
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again.");
    }
  };

  const handleEdit = async (id, oldContent) => {
    const newContent = prompt("Edit your post:", oldContent);
    if (!newContent || newContent === oldContent) return;

    try {
      await axios.put(`http://localhost:5000/api/feed/${id}`, { content: newContent });
      await fetchPosts();
    } catch (err) {
      console.error("Error editing post:", err);
      setError("Failed to edit post. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/feed/${id}`);
      await fetchPosts();
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post. Please try again.");
    }
  };

  return (
    <div className="feed-container">
      <div className="header">Feed</div>

      <div className="main">
        <div className="post-input">
          <textarea 
            placeholder="✏️ Write a post..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <input 
    type="file" 
    accept="image/*" 
    onChange={(e) => setImage(e.target.files[0])} 
  />
          <button onClick={handlePost}>Create Post</button>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="posts">
          {posts.map((post, index) => (
            <div className="post-card" key={index}>
              <div className="post-user">👤 <strong>{post.user.name}</strong></div>
              <div className="post-content">
                {post.content.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
              {/* ✅ Display image if exists */}
    {post.image && (
      <img
        src={`http://localhost:5000/api/feed/${post._id}/image`}
        alt="Post"
        className="post-image"

      />
    )}
              <div className="post-actions">
                <button className='btn' onClick={() => handleEdit(post._id, post.content)}>Edit</button>
                <button className='btn' onClick={() => handleDelete(post._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
