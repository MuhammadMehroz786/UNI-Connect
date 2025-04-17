import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    
    // Set up auth listener to properly track user state
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        
        // Clean up subscription when component unmounts
        return () => unsubscribe();
    }, []);
    
    // Function to fetch posts that can be reused
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/feed");
            console.log("Fetched posts:", response.data);
            setPosts(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError("Failed to load posts. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch all posts on component mount
    useEffect(() => {
        fetchPosts();
    }, []);
    
    // Create a new post
    const handlePost = async () => {
        if (!content.trim()) return;
        if (!user) {
            setError("You must be logged in to post");
            return;
        }
        
        // Use the proper user name with fallback
        const displayName = user.displayName || user.email?.split('@')[0] || "Anonymous User";
        
        try {
            await axios.post("http://localhost:5000/api/feed", {
                user: {
                  uid: user.uid,
                  name: displayName
                },
                content: content
            });
            setContent(""); // clear input
            await fetchPosts(); // re-fetch posts after successful creation
        } catch (err) {
            console.error("Error posting:", err);
            setError("Failed to create post. Please try again.");
        }
    };
    
    // Edit a post
    const handleEdit = async (id, oldContent) => {
        const newContent = prompt("Edit your post:", oldContent);
        if (!newContent || newContent === oldContent) return;
        
        try {
            await axios.put(`http://localhost:5000/api/feed/${id}`, { content: newContent });
            await fetchPosts(); // re-fetch instead of manipulating state directly
        } catch (err) {
            console.error("Error editing post:", err);
            setError("Failed to edit post. Please try again.");
        }
    };
    
    // Delete a post
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/feed/${id}`);
            await fetchPosts(); // re-fetch instead of filtering locally
        } catch (err) {
            console.error("Error deleting post:", err);
            setError("Failed to delete post. Please try again.");
        }
    };
    
    return (
        <div>
            <h2>Feed</h2>
            
            {/* Create new post */}
            <div className="post-creation">
                {user ? (
                    <>
                        <span className="current-user">{user.displayName || user.email?.split('@')[0]|| "Anonymous"}:</span>
                        <input 
                            type="text"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write a post..."
                        />
                        <button onClick={handlePost}>Post</button>
                    </>
                ) : (
                    <p>Please sign in to create posts</p>
                )}
            </div>
            
            {/* Error message */}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            
            {/* Loading state */}
            {loading ? <p>Loading posts...</p> : (
                /* List of posts */
                <ul>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <li key={post._id}>
                                <strong>{post.user?.name || "Unknown User"}:</strong> {post.content}
                                {user && post.user?.uid === user.uid && (
                                    <>
                                        <button onClick={() => handleEdit(post._id, post.content)}>Edit</button>
                                        <button onClick={() => handleDelete(post._id)}>Delete</button>
                                    </>
                                )}
                            </li>
                        ))
                    ) : (
                        <p>No posts available. Be the first to post!</p>
                    )}
                </ul>
            )}
        </div>
    );
};

export default Feed;