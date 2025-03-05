import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HomePage from './components/HomePage';
import FeedPage from './components/FeedPage';
import { AuthProvider } from './contexts/authContext';
import PrivateRoute from './components/PrivateRoute';
import { getAuth, signOut } from 'firebase/auth';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
             <Route 
                path="/home" 
                element={
                  <PrivateRoute>
                    <HomePageWithSignOut />
                  </PrivateRoute>
                } 
              />
              <Route 
              path="/feed" 
              element={
                <PrivateRoute>
                  <FeedPage />
                </PrivateRoute>
              } 
            />
              <Route path="*" element={<LoginPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

// New wrapper component for HomePage with sign-out logic
const HomePageWithSignOut = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login'); // Redirect to login page after sign out
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return <HomePage signOut={handleSignOut} />;
};

export default App;
