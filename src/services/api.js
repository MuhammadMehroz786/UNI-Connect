const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  if (!data.success) {
    throw new Error(data.message || 'Operation failed');
  }
  
  return data;
};

export const searchUsers = async (email) => {
  try {
    const response = await fetch(
      `${API_URL}/users/search?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include'
      }
    );

    const data = await handleResponse(response);
    return data.users;
  } catch (error) {
    console.error('Search users error:', error);
    throw error;
  }
};

export const createOrUpdateUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    });

    const data = await handleResponse(response);
    return data.user;
  } catch (error) {
    console.error('Create/Update user error:', error);
    throw error;
  }
};

export const getUserChats = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/chats/user/${userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include'
    });

    const data = await handleResponse(response);
    return data.chats;
  } catch (error) {
    console.error('Get user chats error:', error);
    throw error;
  }
};

export const createChat = async (participants) => {
  try {
    const response = await fetch(`${API_URL}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ participants })
    });

    const data = await handleResponse(response);
    return data.chat;
  } catch (error) {
    console.error('Create chat error:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId) => {
  try {
    const response = await fetch(`${API_URL}/messages/chat/${chatId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include'
    });

    const data = await handleResponse(response);
    return data.messages;
  } catch (error) {
    console.error('Get messages error:', error);
    throw error;
  }
};

export const sendMessage = async (chatId, senderId, text) => {
  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ chatId, senderId, text })
    });

    const data = await handleResponse(response);
    return data.message;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
}; 