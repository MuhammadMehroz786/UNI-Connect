import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HomePage from './components/HomePage';
import { AuthProvider } from './contexts/authContext';
import PrivateRoute from './components/PrivateRoute';
import { getAuth, signOut } from 'firebase/auth';
import ErrorBoundary from './components/ErrorBoundary';

const handleSignOut = async () => {
  const auth = getAuth();
  try {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error("Error signing out: ", error);
    return false;
  }
};

function App() {
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
                    <HomePage signOut={handleSignOut} />
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
}

export default App;