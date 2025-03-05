import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from '../contexts/authContext'
import ChatList from "./chatlist"
import ChatWindow from "./ChatWindow"
import UserSearch from "./UserSearch"
import { getUserChats, createOrGetChat, subscribeToChatMessages, sendMessage, updateUserPresence } from '../firebase/firestore'
import { db } from '../firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'
import "./chatstyle.css"

function HomePage({ signOut }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showChatList, setShowChatList] = useState(true)

  // Load user's chats
  useEffect(() => {
    const loadChats = async () => {
      if (user?.uid) {
        try {
          setIsLoading(true);
          const userChats = await getUserChats(user.uid);
          
          // Get other user's info for each chat
          const transformedChats = await Promise.all(userChats.map(async chat => {
            const otherUserId = chat.participants.find(id => id !== user.uid);
            const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
            
            return {
              ...chat,
              otherUser: {
                firebaseUid: otherUserId,
                ...otherUserDoc.data()
              }
            };
          }));
          
          setChats(transformedChats);
        } catch (error) {
          console.error('Error loading chats:', error);
          setError('Failed to load chats');
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadChats();
  }, [user]);

  // Load messages when chat is selected
  useEffect(() => {
    if (!selectedChat?.id) return;

    const unsubscribe = subscribeToChatMessages(selectedChat.id, (messages) => {
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  // Add this useEffect for presence
  useEffect(() => {
    if (user?.uid) {
      console.log('Initializing presence for:', user.uid);
      const initPresence = async () => {
        try {
          await updateUserPresence(user.uid);
        } catch (error) {
          console.error('Error initializing presence:', error);
        }
      };
      initPresence();
    }
  }, [user?.uid]);

  // Add this effect to handle mobile navigation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowChatList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendMessage = async (text) => {
    if (!selectedChat?.id || !user?.uid) return;
    
    try {
      await sendMessage(selectedChat.id, user.uid, text);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleNewChat = async (selectedUser) => {
    try {
      if (!user?.uid || selectedUser.firebaseUid === user.uid) return;

      // Create or get existing chat
      const newChat = await createOrGetChat(user.uid, selectedUser.firebaseUid);
      
      // Add the chat to the list if it doesn't exist
      setChats(prevChats => {
        const chatExists = prevChats.some(chat => chat.id === newChat.id);
        if (!chatExists) {
          const chatWithUserInfo = {
            ...newChat,
            otherUser: {
              firebaseUid: selectedUser.firebaseUid,
              email: selectedUser.email,
              displayName: selectedUser.displayName,
              photoURL: selectedUser.photoURL
            }
          };
          return [...prevChats, chatWithUserInfo];
        }
        return prevChats;
      });

      // Select the new chat
      setSelectedChat(newChat);
      setIsSearching(false);
    } catch (error) {
      console.error('Error creating chat:', error);
      throw new Error('Failed to create chat');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    if (window.innerWidth <= 768) {
      setShowChatList(false);
    }
  };

  const handleBackToList = () => {
    setShowChatList(true);
  };
   const goToFeed = () => {
    navigate('/feed');
  };
  return (
    <div className="app">
      <div className="header">
        <button className="feed-button" onClick={goToFeed}>
          Go to Feed
        </button>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="chat-container">
        <div className={`chat-list-container ${!showChatList ? 'hidden' : ''}`}>
          <button 
            className="new-chat-button"
            onClick={() => setIsSearching(true)}
          >
            New Chat
          </button>
          {isLoading ? (
            <div className="loading">Loading chats...</div>
          ) : (
            <ChatList 
              chats={chats} 
              selectedChat={selectedChat} 
              onSelectChat={handleChatSelect}
            />
          )}
        </div>
        {isSearching ? (
          <UserSearch 
            onUserSelect={handleNewChat}
            onClose={() => setIsSearching(false)}
          />
        ) : (
          <ChatWindow 
            chat={selectedChat}
            messages={messages}
            currentUser={user}
            onSendMessage={handleSendMessage}
            onBack={handleBackToList}
          />
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}

export default HomePage;
