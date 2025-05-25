// src/components/LoginPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import Firebase App and Auth functions
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth'; // <--- CRITICAL: Import getAuth and signInWithCustomToken

// YOUR FIREBASE CLIENT-SIDE CONFIGURATION - Load from .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Include if you have it
};

// Initialize Firebase App and Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // <--- CRITICAL: Initialize Firebase Auth

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      console.log("User already logged in from localStorage. Redirecting to home.");
      navigate('/home');
      return;
    }

    console.log("VITE_GOOGLE_CLIENT_ID DEBUG:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('signInDiv'),
        { theme: 'outline', size: 'large', text: 'signin_with', width: '280' }
      );
    } else {
      console.error("Google Identity Services script not loaded yet. Make sure to include it in public/index.html");
      setErrorMessage("Google Sign-In script not loaded. Please check your internet connection or try again later.");
    }
  }, [navigate]);

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    const idToken = response.credential;
    console.log('Google ID Token received:', idToken);

    try {
      setErrorMessage('');
      const backendResponse = await axios.post('http://localhost:5001/auth/google', {
        idToken: idToken,
      });

      console.log('Backend response:', backendResponse.data);

      const { uid, name, email: userEmail, firebaseIdToken: customToken } = backendResponse.data;

      if (uid && customToken) {
        // --- CRITICAL: Sign in to Firebase Auth on the frontend with the custom token ---
        const userCredential = await signInWithCustomToken(auth, customToken); // Use the 'auth' instance
        const firebaseUser = userCredential.user;
        const actualFirebaseIdToken = await firebaseUser.getIdToken(); // Get the actual Firebase ID Token

        console.log("Successfully signed into Firebase Auth on frontend:", firebaseUser.uid);
        // --- END CRITICAL ---

        localStorage.setItem('userUid', uid);
        localStorage.setItem('userName', name || userEmail);
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('googleIdToken', idToken);
        localStorage.setItem('firebaseIdToken', actualFirebaseIdToken); // Store the actual Firebase ID Token

        console.log('User logged in successfully! UID:', uid, 'Actual Firebase ID Token Stored.');

        if (onLoginSuccess) {
          onLoginSuccess();
        }
        setIsLoading(false);

      } else {
        setErrorMessage('Login failed: Invalid response from server (missing UID or Firebase Token).');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error during login process:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(`Login failed: ${error.response.data.message}`);
      } else if (error.code && error.message) {
          setErrorMessage(`Firebase login failed: ${error.message}`); // This will now catch Firebase Auth errors
      }
      else {
        setErrorMessage('Login failed: Server error or network issue.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-screen">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50 rounded-xl">
          <p className="text-white text-2xl font-semibold mb-4">Logging in...</p>
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-sm mt-4">Please wait while we redirect you.</p>
        </div>
      )}

      <div className={`bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-sm w-full border border-white/20 text-white relative overflow-hidden ${isLoading ? 'hidden' : ''}`}>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center text-white mb-6">Welcome to Komiyunity</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 sm:text-sm text-white placeholder-gray-300 transition duration-200"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="mt-1 block w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 sm:text-sm text-white placeholder-gray-300 transition duration-200"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ease-in-out transform hover:scale-105"
            >
              Log In
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-white/70 mb-4">
              Or
            </p>
            <div id="signInDiv" className="mx-auto w-fit"></div>
            {errorMessage && (
                <p className="text-red-400 text-sm mt-4">{errorMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;