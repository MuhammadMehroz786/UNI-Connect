import { useState } from 'react';
import { searchUsersByEmail } from '../firebase/firestore';
import { useAuth } from '../contexts/authContext';
import './UserSearch.css';

function UserSearch({ onUserSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter an email to search');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResults([]);

    try {
      const users = await searchUsersByEmail(searchTerm);
      const filteredUsers = users.filter(user => user.firebaseUid !== currentUser?.uid);
      setSearchResults(filteredUsers);

      if (filteredUsers.length === 0) {
        setError('No users found with that email');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Error searching for users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="user-search-container">
      <div className="user-search">
        <div className="search-header">
          <h2>Start New Chat</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setError('');
              }}
              className="search-input"
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="search-button"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="search-error">
              {error}
            </div>
          )}
        </form>

        <div className="search-results">
          {searchResults.map(user => (
            <div 
              key={user.firebaseUid} 
              className="user-result"
              onClick={() => onUserSelect(user)}
            >
              <img 
                src={user.photoURL || '/placeholder.svg'} 
                alt={user.email}
                className="user-avatar"
                onError={(e) => {
                  e.target.src = '/placeholder.svg';
                }}
              />
              <div className="user-info">
                <h3>{user.email}</h3>
                {user.displayName && <p>{user.displayName}</p>}
              </div>
            </div>
          ))}

          {!isSearching && searchResults.length === 0 && !error && (
            <div className="no-results">
              <p>Search for users to start a chat</p>
            </div>
          )}

          {isSearching && (
            <div className="searching">
              <p>Searching for users...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserSearch; 