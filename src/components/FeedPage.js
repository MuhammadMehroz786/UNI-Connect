import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");
    const auth = getAuth();
    const user = auth.currentUser;

    // Fetch all posts
    useEffect(() => {
        axios.get("/api/feed")
            .then((res) => setPosts(res.data))
            .catch((err) => console.error(err));
    }, []);

    // Create a new post
    const handlePost = async () => {
        if (!content.trim()) return;
        try {
            const res = await axios.post("/api/feed", { user: user.uid, content });
            setPosts([...posts, res.data]);
            setContent("");
        } catch (err) {
            console.error("Error posting:", err);
        }
    };

    // Edit a post
    const handleEdit = async (id, oldContent) => {
        const newContent = prompt("Edit your post:", oldContent);
        if (!newContent) return;

        try {
            const res = await axios.put(`/api/feed/${id}`, { content: newContent });
            setPosts(posts.map((post) => (post._id === id ? res.data : post)));
        } catch (err) {
            console.error("Error editing post:", err);
        }
    };

    // Delete a post
    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/feed/${id}`);
            setPosts(posts.filter((post) => post._id !== id));
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    };

    return (
        <div>
            <h2>Feed</h2>

            {/* Create new post */}
            <input 
                type="text" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Write a post..."
            />
            <button onClick={handlePost}>Post</button>

            {/* List of posts */}
            <ul>
                {posts.map((post) => (
                    <li key={post._id}>
                        <strong>{post.user?.name || "Unknown User"}:</strong> {post.content}
                        {user && post.user === user.uid && (
                            <>
                                <button onClick={() => handleEdit(post._id, post.content)}>Edit</button>
                                <button onClick={() => handleDelete(post._id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Feed;
