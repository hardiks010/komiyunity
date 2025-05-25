// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your components
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage'; // <-- NEW: Import HomePage
import ChatRoom from './ChatRoom'; // Assuming ChatRoom.jsx is directly in src/

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Initialize isLoggedIn state directly from localStorage
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    return storedLoginStatus === 'true'; // Returns true or false on first render
  });

  // Use useEffect to react to changes in isLoggedIn and localStorage for persistence
  useEffect(() => {
    // This effect runs on component mount and when isLoggedIn changes
    // It's mostly for initial load and explicit logout
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    if (storedLoginStatus === 'true') {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []); // Empty dependency array means this runs once on mount


  // Function to update the login state after a successful login from LoginPage
  const handleSuccessfulLogin = () => {
    setIsLoggedIn(true);
    // LoginPage itself will handle the navigate('/home') due to the <Navigate> in the '/' route
  };

  // handleLogout function to be passed to HomePage and ChatRoom
  const handleLogout = () => {
    // Clear all login-related items from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userUid');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('googleIdToken'); // Important: clear this token too
    localStorage.removeItem('firebaseIdToken'); // Clear Firebase ID Token as well

    // Update state to false, which will cause App.jsx to re-render
    // and trigger the <Navigate to="/" /> in the Routes configuration
    setIsLoggedIn(false);
    console.log("User logged out successfully.");
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-800 to-blue-900 flex items-center justify-center">
        <Routes>
          {/*
            Route for the login page ('/').
            If logged in, navigates to /home. Otherwise, shows LoginPage.
            This is the primary entry point after authentication status check.
          */}
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/home" replace /> : <LoginPage onLoginSuccess={handleSuccessfulLogin} />}
          />

          {/*
            NEW: Route for the Home/Main Feed page ('/home').
            This is the central hub after login.
            Requires login. If not logged in, navigates to '/'.
          */}
          <Route
            path="/home"
            element={isLoggedIn ? <HomePage onLogout={handleLogout} /> : <Navigate to="/" replace />}
          />

          {/*
            MODIFIED: Route for a specific chatroom ('/chatroom/:roomName').
            It now accepts a dynamic roomName parameter.
            Requires login. If not logged in, navigates to '/'.
          */}
          <Route
            path="/chatroom/:roomName" // <-- Changed to accept a parameter
            element={isLoggedIn ? <ChatRoom onLogout={handleLogout} /> : <Navigate to="/" replace />}
          />

          {/*
            Fallback route for any other unmatched paths.
            Redirects to /home if logged in, or to '/' (login) if not.
          */}
          <Route
            path="*"
            element={isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;