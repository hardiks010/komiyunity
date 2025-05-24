// komiyunity/frontend/src/ChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import io from 'socket.io-client';

// We'll use socket.id as a temporary unique ID for this tab/user
// This will be replaced with a real user UID after Google Auth
let currentUserId = ''; // Declare outside for persistence across renders

const socket = io('http://localhost:5001');

function ChatRoom() {
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  useEffect(() => {
    console.log('Attempting to connect to Socket.IO server...');

    // Assign currentUserId once socket connects and has an ID
    socket.on('connect', () => {
      currentUserId = socket.id; // Assign the unique socket ID as our temporary user ID
      console.log('Connected to Socket.IO server. My temporary ID:', currentUserId);
    });

    socket.on('chat message', (msg) => {
      console.log('Received message from server:', msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server.');
    });

    return () => {
      console.log('Cleaning up Socket.IO listeners...');
      socket.off('connect'); // Clean up connect listener
      socket.off('chat message');
      socket.off('disconnect');
    };
  }, []);

  // Auto-scroll to the bottom of messages whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSendMessage = () => {
    if (messageInput.trim() && currentUserId) { // Ensure we have a currentUserId
      console.log('Sending message:', messageInput, 'from:', currentUserId);
      // MODIFIED: Send an object with message and senderId
      socket.emit('chat message', { message: messageInput, senderId: currentUserId });
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
      <h2 className="text-2xl font-bold text-center mb-6">Komiyunity Chat</h2>
      <div className="border border-white/20 h-80 overflow-y-auto p-4 mb-4 bg-black/10 rounded-lg flex flex-col"> {/* Added flex flex-col here */}
        {messages.length === 0 ? (
          <p className="text-white/70 text-center mt-24">No messages yet. Start chatting!</p>
        ) : (
          messages.map((msg, index) => {
            const isMyMessage = msg.senderId === currentUserId;
            return (
              <div
                key={index}
                className={`flex mb-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`} // Aligns message bubble
              >
                <div
                  className={`p-3 rounded-lg max-w-[70%] break-words text-sm ${
                    isMyMessage ? 'bg-blue-600 text-white shadow-md' : 'bg-white/20 text-white shadow-sm'
                  }`}
                >
                  {/* Optional: Display sender's ID for debugging/clarity for now */}
                  <span className="block text-xs text-white/70 mb-1">
                    {isMyMessage ? 'You' : `User: ${msg.senderId.substring(0, 4)}...`}
                  </span>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
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