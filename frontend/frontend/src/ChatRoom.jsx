// src/components/ChatRoom.jsx

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMessageSquare, FiSearch, FiPhone, FiVideo, FiInfo, FiPaperclip, FiSmile, FiSend, FiUser, FiCalendar, FiPlusCircle, FiX } from 'react-icons/fi';

// Initialize socket instance without automatic connection
const socket = io('http://localhost:5001', {
  auth: {
    token: localStorage.getItem('googleIdToken')
  },
  autoConnect: false,
  timeout: 5000,
});

function ChatRoom({ onLogout }) {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState('Loading Room...');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  // NEW STATE: Typing indicator
  const [isTyping, setIsTyping] = useState(false);

  const currentUserUid = localStorage.getItem('userUid');
  const currentUserName = localStorage.getItem('userName') || 'Guest';

  // Dummy data for left sidebar (conversations)
  const [conversations, setConversations] = useState([
    { id: '1', name: 'Web Dev Wizards', lastMessage: 'Great work on the new feature!', time: '2 min ago', avatar: 'W', unread: true },
    { id: '2', name: 'AI & ML Enthusiasts', lastMessage: 'Did you see the latest paper?', time: '5 min ago', avatar: 'A' },
    { id: '3', name: 'Game Dev Dojo', lastMessage: 'Unity update is live.', time: '1 hr ago', avatar: 'G' },
    { id: '4', name: 'Cybersecurity Hub', lastMessage: 'Vulnerability found!', time: 'Yesterday', avatar: 'C' },
    { id: '5', name: 'IoT Innovators', lastMessage: 'Smart home ideas...', time: '3 days ago', avatar: 'I' },
    { id: '6', name: 'Anime Discussions', lastMessage: 'Latest episode was wild!', time: '10 min ago', avatar: '鳴', unread: true },
    { id: '7', name: 'Movie Buffs', lastMessage: 'Any good new releases?', time: '30 min ago', avatar: '🎬' },
  ]);

  // Dummy chat data for each room
  const [allChatMessages, setAllChatMessages] = useState({
    '1': [
      { senderId: 'other1', senderName: 'Alice', message: 'Hey team, the new feature is looking great!', timestamp: '09:00 AM' },
      { senderId: currentUserUid, senderName: currentUserName, message: 'Thanks, Alice! We worked hard on it.', timestamp: '09:01 AM' },
      { senderId: 'other2', senderName: 'Bob', message: 'Just tested it, smooth as butter!', timestamp: '09:05 AM' },
      { senderId: 'other1', senderName: 'Alice', message: 'Any feedback for improvement?', timestamp: '09:10 AM' },
    ],
    '2': [
      { senderId: 'other3', senderName: 'Charlie', message: 'Has anyone read the latest paper on transformer models?', timestamp: '10:00 AM' },
      { senderId: currentUserUid, senderName: currentUserName, message: 'Not yet, sending a link?', timestamp: '10:02 AM' },
      { senderId: 'other3', senderName: 'Charlie', message: 'Sure, check out this arXiv link: [link]', timestamp: '10:03 AM' },
    ],
    '3': [
      { senderId: 'other4', senderName: 'David', message: 'Unity update 2023.3 is out! Anyone downloading?', timestamp: '11:30 AM' },
      { senderId: currentUserUid, senderName: currentUserName, message: 'Already on it! Hope it fixes the performance issues.', timestamp: '11:32 AM' },
      { senderId: 'other5', senderName: 'Eve', message: 'Read the release notes carefully, some breaking changes.', timestamp: '11:40 AM' },
    ],
    '4': [
      { senderId: 'other6', senderName: 'Frank', message: 'New zero-day vulnerability in popular library discovered.', timestamp: 'Yesterday' },
      { senderId: currentUserUid, senderName: currentUserName, message: 'Which one? Need to patch our systems ASAP!', timestamp: 'Yesterday' },
      { senderId: 'other6', senderName: 'Frank', message: 'It\'s related to XSS in a widely used JS framework. Details to follow.', timestamp: 'Yesterday' },
    ],
    '5': [
      { senderId: 'other7', senderName: 'Grace', message: 'Brainstorming smart home integration ideas for 2025. Any thoughts?', timestamp: '3 days ago' },
      { senderId: currentUserUid, senderName: currentUserName, message: 'I\'m thinking energy efficiency combined with AI-driven automation.', timestamp: '3 days ago' },
      { senderId: 'other8', senderName: 'Heidi', message: 'Don\'t forget security and privacy as a core feature!', timestamp: '3 days ago' },
    ],
    // Added dummy messages for new chat rooms
    '6': [
      { senderId: 'other9', senderName: 'Naruto Fan', message: 'Did anyone catch the latest episode of "Jujutsu Kaisen"? Blew my mind!', timestamp: '02:00 PM' },
      { senderId: currentUserUid, senderName: currentUserName, message: 'Yess! Gojo is something else.', timestamp: '02:05 PM' },
      { senderId: 'other10', senderName: 'Weeb Lord', message: 'Manga readers already knew 😉', timestamp: '02:10 PM' },
    ],
    '7': [
      { senderId: 'other11', senderName: 'Film Fanatic', message: 'Just saw "Dune: Part Two" – absolutely stunning visuals!', timestamp: '08:00 PM' },
      { senderId: currentUserUid, senderName: currentUserName, message: 'Agreed! The sound design was incredible too.', timestamp: '08:15 PM' },
      { senderId: 'other11', senderName: 'Film Fanatic', message: 'Any other recommendations for this weekend?', timestamp: '08:30 PM' },
    ],
  });

  const [activeChatPartner, setActiveChatPartner] = useState({
    id: 'u-current',
    name: 'Default User', // Changed default name to be more generic
    status: 'Online',
    avatar: 'D'
  });

  // State for scheduled sessions
  const [scheduledSessions, setScheduledSessions] = useState([
    { date: '2025-05-27', title: 'Live Session: Web Dev Best Practices', room: 'Web Dev Wizards', topic: 'Web Development' },
    { date: '2025-05-28', title: 'Q&A: Latest ML Research', room: 'AI & ML Enthusiasts', topic: 'Machine Learning' },
    { date: '2025-05-30', title: 'Movie Night: Anime Classics', room: 'Anime Discussions', topic: 'Anime' },
  ]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSession, setNewSession] = useState({
    date: '',
    time: '',
    title: '',
    room: '',
    topic: ''
  });

  useEffect(() => {
    const googleIdToken = localStorage.getItem('googleIdToken');
    const storedRoomName = localStorage.getItem('currentRoomName');

    if (storedRoomName) {
        setRoomName(storedRoomName);
        setActiveChatPartner(prev => ({ ...prev, name: storedRoomName, avatar: storedRoomName.charAt(0).toUpperCase() }));
    } else {
        const foundConv = conversations.find(conv => conv.id === roomId);
        if (foundConv) {
            setRoomName(foundConv.name);
            setActiveChatPartner(prev => ({ ...prev, name: foundConv.name, avatar: foundConv.avatar }));
        } else {
            console.warn('Room name not found in localStorage or dummy data. Displaying default name.');
            setRoomName(`Room ${roomId}`);
            setActiveChatPartner(prev => ({ ...prev, name: `Room ${roomId}`, avatar: roomId.charAt(0).toUpperCase() }));
        }
    }

    setMessages(allChatMessages[roomId] || []);

    const splashScreenTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    if (!currentUserUid || !googleIdToken) {
      console.log('Not authenticated for chat. Redirecting to login...');
      navigate('/');
      return;
    }

    socket.auth.token = googleIdToken;

    if (!socket.connected) {
      console.log('Attempting to connect to Socket.IO server as:', currentUserName, 'UID:', currentUserUid);
      socket.connect();
    }

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server as:', currentUserName, 'UID:', currentUserUid);
      if (roomId) {
          console.log(`Re-joining room on connect: ${roomId}`);
          socket.emit('join room', roomId);
      }
    });

    socket.on('chat message', (msg) => {
      console.log('Received message:', msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
      setAllChatMessages(prevAllMessages => ({
        ...prevAllMessages,
        [msg.roomId]: [...(prevAllMessages[msg.roomId] || []), msg]
      }));
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server. Reason:', reason);
      if (reason === 'io server disconnect' || reason === 'transport close') {
          alert('Chat session ended by server. Please log in again.');
          if (onLogout) {
            onLogout();
          } else {
            localStorage.clear();
            navigate('/');
          }
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
      if (error.message.includes('Authentication error')) {
        alert('Your chat session has expired or is invalid. Please log in again.');
        if (onLogout) {
            onLogout();
        } else {
            localStorage.clear();
            navigate('/');
        }
      }
    });

    if (socket.connected && roomId) {
        console.log(`Attempting to join room: ${roomId}`);
        socket.emit('join room', roomId);
    }

    return () => {
      clearTimeout(splashScreenTimeout);
      console.log('Cleaning up Socket.IO listeners and disconnecting...');
      socket.off('connect');
      socket.off('chat message');
      socket.off('disconnect');
      socket.off('connect_error');
      if (socket.connected && roomId) {
          console.log(`Leaving room: ${roomId}`);
          socket.emit('leave room', roomId);
      }
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [currentUserUid, navigate, onLogout, roomId, allChatMessages, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
          senderId: currentUserUid,
          senderName: currentUserName,
          message: messageInput,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prevMessages => [...prevMessages, newMessage]);
      setAllChatMessages(prevAllMessages => ({
        ...prevAllMessages,
        [roomId]: [...(prevAllMessages[roomId] || []), newMessage]
      }));
      socket.emit('chat message', { message: messageInput, roomId: roomId });
      setMessageInput('');

      // Simulate a reply after a short delay
      setIsTyping(true); // Show typing indicator
      setTimeout(() => {
        setIsTyping(false); // Hide typing indicator

        const hardcodedReplyMessage = {
          senderId: 'bot-reply', // A unique ID for the "bot"
          senderName: activeChatPartner.name, // Use the active chat partner's name
          message: `Hello ${currentUserName}! what's up dude? i am ${activeChatPartner.name} btw.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prevMessages => [...prevMessages, hardcodedReplyMessage]);
        setAllChatMessages(prevAllMessages => ({
          ...prevAllMessages,
          [roomId]: [...(prevAllMessages[roomId] || []), hardcodedReplyMessage]
        }));
      }, 2000); // Simulate typing for 2 seconds
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleScheduleSession = (e) => {
    e.preventDefault();
    if (newSession.date && newSession.time && newSession.title && newSession.room && newSession.topic) {
      setScheduledSessions(prev => [...prev, {
        date: newSession.date,
        title: `${newSession.time} - ${newSession.title}`,
        room: newSession.room,
        topic: newSession.topic
      }]);
      setNewSession({ date: '', time: '', title: '', room: '', topic: '' });
      setShowScheduleModal(false);
    } else {
      alert('Please fill all fields to schedule a session.');
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);

  const getSessionsForDate = (day) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return scheduledSessions.filter(session => session.date === dateString);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 transition-opacity duration-500 ease-in-out">
        <div className="text-center">
          <div className="animate-bounce text-purple-400 text-6xl mb-6">
            <FiMessageSquare />
          </div>
          <p className="text-white text-3xl font-bold mb-3">Entering Komiyunity Chat</p>
          <p className="text-purple-200 text-xl font-semibold">" {roomName} "</p>
          <div className="mt-8 flex items-center justify-center">
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse mx-1 animation-delay-0"></div>
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse mx-1 animation-delay-150"></div>
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse mx-1 animation-delay-300"></div>
          </div>
          <p className="text-gray-400 text-sm mt-6">Please wait while we connect you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen bg-gradient-to-br from-purple-800 to-blue-900 font-sans text-white">
      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-xl w-96 border border-white/20 relative">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              <FiX size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Schedule New Session</h3>
            <form onSubmit={handleScheduleSession} className="space-y-4">
              <div>
                <label htmlFor="session-title" className="block text-sm font-medium text-gray-300 mb-1">Session Title</label>
                <input
                  type="text"
                  id="session-title"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  placeholder="e.g., React Hooks Deep Dive"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="session-date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    id="session-date"
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="session-time" className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                  <input
                    type="time"
                    id="session-time"
                    value={newSession.time}
                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="session-room" className="block text-sm font-medium text-gray-300 mb-1">Related Room</label>
                <select
                  id="session-room"
                  value={newSession.room}
                  onChange={(e) => setNewSession({ ...newSession, room: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  required
                >
                  <option value="" disabled>Select a chat room</option>
                  {conversations.map(conv => (
                    <option key={conv.id} value={conv.name}>{conv.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="session-topic" className="block text-sm font-medium text-gray-300 mb-1">Topic/Category</label>
                <input
                  type="text"
                  id="session-topic"
                  value={newSession.topic}
                  onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  placeholder="e.g., Frontend, AI, Sci-Fi"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200"
              >
                Schedule Session
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Left Sidebar (Conversations List) */}
      <aside className="w-80 bg-white/5 backdrop-blur-md shadow-lg flex flex-col border-r border-white/10 rounded-l-xl overflow-hidden mr-4 my-4 ml-4">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Chat</h2>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition duration-200">Chat</button>
            <button className="px-4 py-2 bg-white/10 text-white rounded-md text-sm hover:bg-white/20 transition duration-200">New</button>
          </div>
        </div>
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-1 focus:ring-purple-400 text-white placeholder-gray-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`flex items-center p-4 border-b border-white/5 cursor-pointer hover:bg-white/10 transition duration-200 ${conv.id === roomId ? 'bg-white/15' : ''}`}
              onClick={() => {
                localStorage.setItem('currentRoomName', conv.name);
                navigate(`/chat/${conv.id}`);
              }}
            >
              <div className="w-12 h-12 flex items-center justify-center bg-purple-500 text-white rounded-full font-semibold text-lg mr-3">
                {conv.avatar}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white">{conv.name}</h3>
                  <span className="text-xs text-gray-400">{conv.time}</span>
                </div>
                <p className="text-sm text-gray-300 truncate">{conv.lastMessage}</p>
                {conv.unread && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white/5 backdrop-blur-md border-r border-white/10 rounded-xl my-4">
        {/* Chat Header */}
        <div className="p-4 bg-white/5 border-b border-white/10 shadow-sm flex items-center justify-between rounded-t-xl">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center bg-purple-500 text-white rounded-full font-semibold text-md mr-3">
              {activeChatPartner.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">{roomName}</h3>
              {/* NEW: Display typing status */}
              <span className="text-sm text-gray-400">
                {isTyping ? (
                  <span className="flex items-center">
                    <span className="mr-1">Typing</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce-dot animation-delay-0"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce-dot animation-delay-150 ml-1"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce-dot animation-delay-300 ml-1"></span>
                  </span>
                ) : (
                  activeChatPartner.status
                )}
              </span>
            </div>
          </div>
          <div className="flex space-x-4 text-gray-400">
            <FiPhone size={20} className="hover:text-purple-400 cursor-pointer transition duration-200" />
            <FiVideo size={20} className="hover:text-purple-400 cursor-pointer transition duration-200" />
            <FiInfo size={20} className="hover:text-purple-400 cursor-pointer transition duration-200" />
          </div>
        </div>

        {/* Messages Display */}
        <div className="flex-1 overflow-y-auto p-6 bg-transparent">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center mt-24">No messages yet. Start chatting!</p>
          ) : (
            messages.map((msg, index) => {
              const isMyMessage = msg.senderId === currentUserUid;
              // If the sender is the "bot-reply", use the activeChatPartner's avatar
              const senderInitial = (msg.senderId === 'bot-reply' ? activeChatPartner.name : msg.senderName || 'U').charAt(0).toUpperCase();

              return (
                <div
                  key={index}
                  className={`flex mb-4 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMyMessage && (
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-600 text-white rounded-full font-semibold text-sm mr-3 flex-shrink-0">
                      {senderInitial}
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-lg max-w-[70%] break-words text-sm relative ${
                      isMyMessage
                        ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                        : 'bg-white/10 text-white rounded-bl-none shadow-sm border border-white/20'
                    }`}
                    // Adjust padding-bottom to make space for the timestamp
                    style={{ paddingBottom: '20px' }} // Added padding-bottom
                  >
                    {!isMyMessage && (
                      <span className="block text-xs text-purple-400 font-semibold mb-1">
                        {msg.senderName || 'User'}
                      </span>
                    )}
                    {msg.message}
                    <span className={`absolute bottom-1 text-xs ${isMyMessage ? 'right-2 text-purple-200' : 'left-2 text-gray-400'}`}>
                        {msg.timestamp}
                    </span>
                  </div>
                  {isMyMessage && (
                    <div className="w-8 h-8 flex items-center justify-center bg-purple-500 text-white rounded-full font-semibold text-sm ml-3 flex-shrink-0">
                      {currentUserName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center space-x-3 rounded-b-xl">
          <FiPaperclip size={20} className="text-gray-400 hover:text-purple-400 cursor-pointer transition duration-200" />
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:ring-1 focus:ring-purple-400 text-white placeholder-gray-400"
          />
          <FiSmile size={20} className="text-gray-400 hover:text-purple-400 cursor-pointer transition duration-200" />
          <button
            onClick={handleSendMessage}
            className="p-3 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-700 transition-colors duration-200"
          >
            <FiSend size={20} />
          </button>
        </div>
      </main>

      {/* Right Sidebar (Calendar & Scheduled Sessions) */}
      <aside className="w-80 bg-white/5 backdrop-blur-md shadow-lg flex flex-col border-l border-white/10 rounded-r-xl overflow-hidden ml-4 my-4 mr-4">
        <div className="p-4 border-b border-white/10 text-center">
          <div className="w-24 h-24 flex items-center justify-center bg-purple-500 text-white rounded-full font-semibold text-4xl mx-auto mb-3">
            {activeChatPartner.avatar}
          </div>
          <h3 className="text-xl font-bold text-white">{activeChatPartner.name}</h3>
          <p className="text-sm text-gray-400">{activeChatPartner.status}</p>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <h4 className="font-semibold text-lg text-white mb-3">Community Calendar</h4>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day} className="font-bold">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm mb-4">
            {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(day => {
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasSession = scheduledSessions.some(session => session.date === dateString);
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

              return (
                <div
                  key={day}
                  className={`relative p-2 rounded-full cursor-pointer transition-colors duration-200
                    ${isToday ? 'bg-purple-600 text-white' : 'hover:bg-white/10'}
                    ${hasSession && !isToday ? 'bg-blue-600/20 border border-blue-400 text-blue-200' : ''}
                  `}
                  title={hasSession ? getSessionsForDate(day).map(s => s.title).join('\n') : ''}
                >
                  {day}
                  {hasSession && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></span>
                  )}
                </div>
              );
            })}
          </div>
          <h4 className="font-semibold text-lg text-white mt-4 mb-3">Upcoming Sessions</h4>
          {scheduledSessions.length > 0 ? (
            <div className="space-y-3">
              {scheduledSessions.map((session, index) => (
                <div key={index} className="bg-white/10 p-3 rounded-lg border border-white/20">
                  <p className="font-semibold text-white text-sm">{session.date} - {session.title}</p>
                  <p className="text-xs text-gray-300">Room: {session.room}</p>
                  <p className="text-xs text-gray-300">Topic: {session.topic}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No sessions scheduled.</p>
          )}

          <button
            onClick={() => setShowScheduleModal(true)}
            className="w-full mt-4 flex items-center justify-center py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm transition duration-200"
          >
            <FiPlusCircle className="mr-2" /> Schedule New Session
          </button>
        </div>
        <div className="p-4 border-t border-white/10 text-center">
            <button
                onClick={onLogout}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition duration-150 ease-in-out"
            >
                Logout
            </button>
        </div>
      </aside>
    </div>
  );
}

export default ChatRoom;