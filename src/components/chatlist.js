import React, { useState } from 'react';

function ChatList({ chats = [], selectedChat, onSelectChat }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!Array.isArray(chats)) {
    return null;
  }

  const filteredChats = chats.filter((chat) => {
    const email = chat?.otherUser?.email || '';
    return email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getDisplayName = (chat) => {
    return chat.otherUser?.displayName || chat.otherUser?.email.split('@')[0];
  };

  return (
    <div className="chat-list">
      <h2>Chats</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ul>
        {filteredChats.map((chat) => {
          const otherUser = chat?.otherUser || {};
          const email = otherUser.email || 'Unknown User';
          const lastMessage = chat?.lastMessage?.text || 'No messages yet';

          return (
            <li
              key={chat.id || chat._id}
              className={`chat-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <img
                src={otherUser.photoURL || '/placeholder.svg'}
                alt={email}
                className="avatar"
              />
              <div className="chat-info">
                <h3 className="chat-name">{getDisplayName(chat)}</h3>
                <p className="last-message">{lastMessage}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {filteredChats.length === 0 && (
        <div className="no-chats">
          <p>
            {searchTerm 
              ? 'No chats found matching your search'
              : 'No chats yet. Start a new conversation!'}
          </p>
        </div>
      )}
    </div>
  );
}

export default ChatList;
