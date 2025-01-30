import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { sendMessage, subscribeToUserPresence } from '../firebase/firestore';

const OnlineStatus = ({ isOnline }) => (
  <div className="online-status-indicator">
    <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
    <span className="status-text">
      {isOnline ? 'Online' : 'Offline'}
    </span>
  </div>
);

function ChatWindow({ chat, messages, currentUser, onSendMessage, onBack }) {
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!chat?.otherUser?.firebaseUid) return;

    console.log('Setting up presence for:', chat.otherUser.firebaseUid);

    const unsubscribe = subscribeToUserPresence(
      chat.otherUser.firebaseUid,
      (isOnline) => {
        console.log('Presence update:', isOnline);
        setIsOtherUserOnline(isOnline);
      }
    );

    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error cleaning up presence subscription:', error);
      }
    };
  }, [chat?.otherUser?.firebaseUid]);

  if (!chat) {
    return (
      <div className="chat-window">
        <div className="no-chat-selected">
          <p>Select a chat or start a new conversation</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    try {
      await sendMessage(chat.id, currentUser.uid, text);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const displayName = chat.otherUser?.displayName || chat.otherUser?.email.split('@')[0];

  return (
    <div className={`chat-window ${!chat ? 'hidden' : ''}`}>
      {!chat ? (
        <div className="no-chat-selected">
          <p>Select a chat or start a new conversation</p>
        </div>
      ) : (
        <>
          <div className="chat-header">
            {isMobile && (
              <button className="back-button" onClick={onBack}>
                <FaArrowLeft />
              </button>
            )}
            <div className="user-info-container">
              <div className="avatar-container">
                <img 
                  src={chat.otherUser?.photoURL || '/placeholder.svg'} 
                  alt="avatar" 
                  className="avatar"
                />
                <span className={`status-indicator ${isOtherUserOnline ? 'online' : 'offline'}`} />
              </div>
              <div className="user-info">
                <h2>{displayName}</h2>
                <OnlineStatus isOnline={isOtherUserOnline} />
              </div>
            </div>
          </div>
          
          <MessageList 
            messages={messages} 
            currentUser={currentUser}
            otherUser={chat.otherUser}
            chatId={chat.id}
          />
          
          <MessageInput onSendMessage={handleSendMessage} />
        </>
      )}
    </div>
  );
}

export default ChatWindow;

