import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  doc,
  setDoc,
  orderBy, 
  onSnapshot,
  serverTimestamp,
  enableIndexedDbPersistence,
  deleteDoc,
  updateDoc,
  limit
} from 'firebase/firestore';

// Initialize persistence once
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.log('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser does not support persistence
    console.log('Persistence not supported');
  }
});

// Search users by email
export const searchUsersByEmail = async (email) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('email', '>=', email.toLowerCase()),
      where('email', '<=', email.toLowerCase() + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      firebaseUid: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Create or get existing chat
export const createOrGetChat = async (currentUserId, otherUserId) => {
  try {
    // Check if chat already exists
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUserId)
    );
    
    const querySnapshot = await getDocs(q);
    const existingChat = querySnapshot.docs.find(doc => {
      const data = doc.data();
      return data.participants.includes(otherUserId);
    });

    if (existingChat) {
      return {
        id: existingChat.id,
        ...existingChat.data()
      };
    }

    // Create new chat
    const chatData = {
      participants: [currentUserId, otherUserId],
      createdAt: serverTimestamp(),
      lastMessage: null
    };

    const newChatRef = await addDoc(chatsRef, chatData);
    return {
      id: newChatRef.id,
      ...chatData
    };
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    throw error;
  }
};

// Get user's chats
export const getUserChats = async (userId) => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

// Subscribe to chat messages
export const subscribeToChatMessages = (chatId, callback) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  }, (error) => {
    console.error('Error subscribing to messages:', error);
  });
};

// Send message
export const sendMessage = async (chatId, senderId, text) => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messageData = {
      senderId,
      text,
      timestamp: serverTimestamp()
    };

    // Add message to messages subcollection
    const messageRef = await addDoc(messagesRef, messageData);

    // Update last message in chat document
    const chatRef = doc(db, 'chats', chatId);
    await setDoc(chatRef, {
      lastMessage: {
        id: messageRef.id,
        text,
        senderId,
        timestamp: serverTimestamp()
      }
    }, { merge: true });

    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Update the user presence function
export const updateUserPresence = async (userId) => {
  try {
    const userStatusRef = doc(db, 'status', userId);
    const userRef = doc(db, 'users', userId);

    const isOfflineData = {
      state: 'offline',
      lastChanged: serverTimestamp(),
    };

    const isOnlineData = {
      state: 'online',
      lastChanged: serverTimestamp(),
    };

    // Set initial online status
    await setDoc(userStatusRef, isOnlineData);
    await updateDoc(userRef, { isOnline: true }, { merge: true });

    // Set up offline status for when user disconnects
    window.addEventListener('beforeunload', async () => {
      await setDoc(userStatusRef, isOfflineData);
      await updateDoc(userRef, { isOnline: false }, { merge: true });
    });

    // Set up real-time connection monitoring
    onSnapshot(doc(db, '.info/connected'), async (snapshot) => {
      if (snapshot.exists()) {
        await setDoc(userStatusRef, isOnlineData);
        await updateDoc(userRef, { isOnline: true }, { merge: true });
      } else {
        await setDoc(userStatusRef, isOfflineData);
        await updateDoc(userRef, { isOnline: false }, { merge: true });
      }
    });
  } catch (error) {
    console.error('Error updating user presence:', error);
  }
};

// Subscribe to user's online status
export const subscribeToUserPresence = (userId, callback) => {
  try {
    // Subscribe to Firestore status
    return onSnapshot(doc(db, 'status', userId), (doc) => {
      const isOnline = doc.exists() && doc.data()?.state === 'online';
      console.log('User status update:', userId, isOnline); // Add this for debugging
      callback(isOnline);
    }, (error) => {
      console.error('Error subscribing to presence:', error);
      callback(false);
    });
  } catch (error) {
    console.error('Error setting up presence subscription:', error);
    callback(false);
    return () => {};
  }
};

// Add this new function
export const deleteMessage = async (chatId, messageId) => {
  try {
    // Delete the message
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await deleteDoc(messageRef);

    // Check if it was the last message and update chat if needed
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    
    const chatRef = doc(db, 'chats', chatId);
    if (snapshot.empty) {
      // No messages left
      await updateDoc(chatRef, {
        lastMessage: null
      });
    } else {
      // Update with new last message
      const lastMessage = snapshot.docs[0].data();
      await updateDoc(chatRef, {
        lastMessage: {
          id: snapshot.docs[0].id,
          text: lastMessage.text,
          senderId: lastMessage.senderId,
          timestamp: lastMessage.timestamp
        }
      });
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}; 