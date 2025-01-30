import React, { useRef, useEffect, useState } from 'react';
import { deleteMessage } from '../firebase/firestore';
import { FaTrash } from 'react-icons/fa';

function MessageList({ messages, currentUser, otherUser, chatId }) {
  const messagesEndRef = useRef(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getDisplayName = (userId) => {
    if (userId === currentUser.uid) {
      return currentUser.displayName || currentUser.email.split('@')[0];
    }
    return otherUser?.displayName || otherUser?.email.split('@')[0];
  };

  const handleDeleteMessage = async (messageId, event) => {
    event.stopPropagation(); // Prevent event bubbling
    
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      setDeletingMessageId(messageId);
      await deleteMessage(chatId, messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    } finally {
      setDeletingMessageId(null);
    }
  };

  return (
    <div className="message-list">
      {messages.map((message) => {
        const isOwnMessage = message.senderId === currentUser.uid;
        
        return (
          <div
            key={message.id}
            className={`message ${isOwnMessage ? 'sent' : 'received'}`}
          >
            {isOwnMessage && (
              <button
                className={`delete-message ${deletingMessageId === message.id ? 'deleting' : ''}`}
                onClick={(e) => handleDeleteMessage(message.id, e)}
                disabled={deletingMessageId === message.id}
                title="Delete message"
              >
                <FaTrash size={14} />
              </button>
            )}
            <div className="message-content">
              <div className="message-sender">
                <strong>{getDisplayName(message.senderId)}</strong>
              </div>
              <p className="message-text">{message.text}</p>
              <span className="timestamp">
                {message.timestamp?.toDate().toLocaleTimeString()}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
  
  