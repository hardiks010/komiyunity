import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

// Initialize socket instance without automatic connection
// The token will be passed for authentication when .connect() is called
const socket = io('http://localhost:5001', {
  auth: {
    // This token will be read from localStorage when .connect() is called later
    // It should be the Google ID Token you saved from the LoginPage.
    token: localStorage.getItem('googleIdToken')
  },
  autoConnect: false, // Prevents automatic connection on creation
  timeout: 5000,
});

// ACCEPT THE ONLOGOUT PROP HERE
function ChatRoom({ onLogout }) {
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Get user info directly inside the component or effect,
  // as it might change after login
  const currentUserUid = localStorage.getItem('userUid');
  const currentUserName = localStorage.getItem('userName') || 'Guest';

  useEffect(() => {
    // Get the latest Google ID Token from localStorage when the effect runs
    const googleIdToken = localStorage.getItem('googleIdToken');

    // Only proceed and connect if authenticated (userUid and token exist)
    if (!currentUserUid || !googleIdToken) {
      console.log('Not authenticated for chat. Redirecting to login...');
      navigate('/'); // Redirect to login page if not authenticated
      return;
    }

    // Update the socket's auth token in case it changed since initialization
    socket.auth.token = googleIdToken;

    // Connect the socket explicitly if not already connected
    if (!socket.connected) {
      console.log('Attempting to connect to Socket.IO server as:', currentUserName, 'UID:', currentUserUid);
      socket.connect(); // Explicitly connect here
    }

    // Socket.IO Event Listeners
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server as:', currentUserName, 'UID:', currentUserUid);
    });

    socket.on('chat message', (msg) => {
      console.log('Received message:', msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server. Reason:', reason);
      // Optional: Handle specific disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
          // If the server explicitly disconnected, might need to re-authenticate
          alert('Chat session ended by server. Please log in again.');
          // Use the onLogout prop for a clean logout
          if (onLogout) { // Ensure onLogout is passed before calling
            onLogout();
          } else { // Fallback if onLogout isn't provided (shouldn't happen with App.jsx setup)
            localStorage.clear();
            navigate('/');
          }
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
      // Handle authentication errors, e.g., if the token is invalid or expired
      if (error.message.includes('Authentication error')) {
        alert('Your chat session has expired or is invalid. Please log in again.');
        // Use the onLogout prop for a clean logout
        if (onLogout) { // Ensure onLogout is passed before calling
            onLogout();
        } else { // Fallback if onLogout isn't provided
            localStorage.clear();
            navigate('/');
        }
      }
    });

    // Cleanup function for when the component unmounts or dependencies change
    return () => {
      console.log('Cleaning up Socket.IO listeners and disconnecting...');
      socket.off('connect');
      socket.off('chat message');
      socket.off('disconnect');
      socket.off('connect_error');
      // Disconnect socket if this component is no longer rendered
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [currentUserUid, navigate, onLogout]); // ADD onLogout to dependencies

  // Scroll to bottom of chat messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Send only the message, backend will attach actual senderId/senderName
      socket.emit('chat message', { message: messageInput });
      setMessageInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 font-sans text-white relative overflow-hidden">
      {/* NEW: Flex container for header and logout button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-center flex-grow">Komiyunity Chat ({currentUserName})</h2>
        {/* LOGOUT BUTTON */}
        <button
          onClick={onLogout} 
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out ml-4"
        >
          Logout
        </button>
      </div>

      <div className="border border-white/20 h-80 overflow-y-auto p-4 mb-4 bg-black/10 rounded-lg flex flex-col">
        {messages.length === 0 ? (
          <p className="text-white/70 text-center mt-24">No messages yet. Start chatting!</p>
        ) : (
          messages.map((msg, index) => {
            // Compare senderId from message with authenticated currentUserUid
            const isMyMessage = msg.senderId === currentUserUid;
            return (
              <div
                key={index}
                className={`flex mb-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[70%] break-words text-sm ${
                    isMyMessage ? 'bg-blue-600 text-white shadow-md' : 'bg-white/20 text-white shadow-sm'
                  }`}
                >
                  <span className="block text-xs text-white/70 mb-1">
                    {isMyMessage ? 'You' : `${msg.senderName || 'User'}:`} {/* Use senderName */}
                  </span>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-grow px-4 py-2 bg-white/5 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 text-base placeholder-gray-300 text-white transition duration-200"
        />
        <button
          onClick={handleSendMessage}
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:scale-105"
        >
          Send
        </button>
      </div>
      <p className="text-xs text-white/60 text-center mt-4">
        *Remember: Your Node.js backend server must be running on port 5001 for chat to work!
      </p>
    </div>
  );
}

export default ChatRoom;