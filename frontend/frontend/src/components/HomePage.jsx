// src/components/HomePage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiCompass, FiUsers, FiSettings, FiSearch, FiMessageSquare, FiPlus, FiBell, FiMail, FiChevronRight, FiGrid, FiDollarSign } from 'react-icons/fi'; // Added FiGrid, FiDollarSign for SAFA aesthetic

function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [searchRoomsResults, setSearchRoomsResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // HARDCODED DUMMY DATA FOR UI DEMO - START
  const [popularRooms, setPopularRooms] = useState([
    { id: '1', name: 'Web Dev Wizards', description: 'Discussions on React, Node.js, and modern web tech.', members: 45, messages: 120 },
    { id: '2', name: 'AI & ML Enthusiasts', description: 'Latest in AI, machine learning, and data science.', members: 32, messages: 85 },
    { id: '3', name: 'Game Dev Dojo', description: 'Unity, Unreal, and indie game development chats.', members: 28, messages: 60 },
    { id: '4', name: 'Cybersecurity Hub', description: 'Defending against threats and ethical hacking.', members: 50, messages: 150 },
    { id: '5', name: 'IoT Innovators', description: 'Smart devices, automation, and connected tech.', members: 18, messages: 40 },
    { id: '6', name: 'Blockchain Basics', description: 'Exploring decentralized ledgers and crypto.', members: 40, messages: 110 },
  ]);

  const [activeUsers, setActiveUsers] = useState([
    { id: 'u1', name: 'Hardik Sati', status: 'Online' },
    { id: 'u2', name: 'Deepanshu Kumar', status: 'Online' },
    { id: 'u3', name: 'Ankita Sharma', status: 'Offline' },
    { id: 'u4', name: 'Rahul Gupta', status: 'Online' },
    { id: 'u5', name: 'Priya Singh', status: 'Online' },
    { id: 'u6', name: 'Vikram Patel', status: 'Away' },
    { id: 'u7', name: 'Sneha Reddy', status: 'Online' },
  ]);
  // HARDCODED DUMMY DATA FOR UI DEMO - END

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      navigate('/');
    }
    // No need to fetch real rooms/users for UI demo if hardcoded data is used
    // fetchChatRooms();
    // fetchActiveUsers();
  }, [navigate]);


  // Placeholder function for handling actual room creation if a modal/page is triggered
  const handleStartKomiyunityClick = () => {
    alert("This button would open a modal or navigate to a 'Create Room' page!");
    // You can later add logic to set a state to show a modal: setShowCreateRoomModal(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleJoinRoom = (roomId) => {
    // For demo, just alert for now, or navigate to a dummy chat page
    alert(`Joining room: ${roomId}`);
    // navigate(`/chat/${roomId}`); // Uncomment when chat page is ready
  };

  const handleRoomSearch = () => {
    if (roomSearchQuery.trim() === '') {
      setSearchRoomsResults([]);
      return;
    }
    // Search the hardcoded popularRooms for demo
    const filtered = popularRooms.filter(room =>
      room.name.toLowerCase().includes(roomSearchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(roomSearchQuery.toLowerCase())
    );
    setSearchRoomsResults(filtered);
    // In a real app, this would trigger a backend API call and potentially update activeUsers based on search.
  };

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 font-sans relative">
      {/* Top Bar - SAFA Style */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-md flex items-center justify-between px-8 z-20 shadow-lg border-b border-gray-700">
        <div className="flex items-center">
          <h1 className="text-3xl font-extrabold text-indigo-400">Komiyunity</h1>
        </div>
        <div className="flex items-center space-x-6">
          <FiSearch size={24} className="text-gray-400 hover:text-white cursor-pointer transition-colors duration-200" />
          <FiBell size={24} className="text-gray-400 hover:text-white cursor-pointer transition-colors duration-200" />
          <FiMail size={24} className="text-gray-400 hover:text-white cursor-pointer transition-colors duration-200" />
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer border-2 border-indigo-400 transition-transform duration-200 hover:scale-110">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Layout Container (Below Top Bar) */}
      <div className="flex flex-1 pt-16"> {/* pt-16 to offset the fixed header */}
        {/* Left Sidebar - SAFA-inspired Dashboard Style */}
        <aside className="w-64 bg-gray-900 p-6 flex flex-col justify-between border-r border-gray-800 shadow-xl">
          <nav>
            <ul className="space-y-2"> {/* Reduced spacing slightly for more items */}
              <li>
                <a href="#" className="flex items-center py-2 px-4 rounded-lg text-lg font-medium text-gray-300 hover:bg-gray-800 hover:text-indigo-400 transition-all duration-200">
                  <FiGrid className="mr-3 text-xl" /> Dashboard {/* Using Grid icon for dashboard look */}
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center py-2 px-4 rounded-lg text-lg font-medium text-gray-300 hover:bg-gray-800 hover:text-indigo-400 transition-all duration-200">
                  <FiCompass className="mr-3 text-xl" /> Explore Communities
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center py-2 px-4 rounded-lg text-lg font-medium text-gray-300 hover:bg-gray-800 hover:text-indigo-400 transition-all duration-200">
                  <FiUsers className="mr-3 text-xl" /> My Communities
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center py-2 px-4 rounded-lg text-lg font-medium text-gray-300 hover:bg-gray-800 hover:text-indigo-400 transition-all duration-200">
                  <FiMessageSquare className="mr-3 text-xl" /> My Messages
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center py-2 px-4 rounded-lg text-lg font-medium text-gray-300 hover:bg-gray-800 hover:text-indigo-400 transition-all duration-200">
                  <FiSettings className="mr-3 text-xl" /> Settings
                </a>
              </li>
            </ul>
          </nav>
          {/* SAFA-inspired "Upgrade Your Plan" / "Start Komiyunity" CTA */}
          <div className="mt-auto p-4 bg-purple-700/30 rounded-xl border border-purple-600 shadow-md text-center">
            <h4 className="text-lg font-semibold mb-2 text-white">Share Your Expertise!</h4>
            <p className="text-sm text-gray-200 mb-4">Create a new Komiyunity for your niche topic.</p>
            <button
              onClick={handleStartKomiyunityClick} // Use this for the alert/modal
              className="w-full flex items-center justify-center py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              Start Komiyunity <FiChevronRight className="ml-2" />
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            Logout
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-8 overflow-y-auto bg-gray-900"> {/* Added bg-gray-900 for main content to match overall theme */}
          {/* Top Banner with Search Bar (Replacing "Create your NFT Marketplace" banner) */}
          <section className="relative w-full h-48 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl shadow-xl flex items-center justify-center mb-8 overflow-hidden">
            {/* Background elements to mimic SAFA banner's complexity */}
            <div className="absolute inset-0 bg-cover bg-center opacity-30 z-0" style={{ backgroundImage: "url('https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=Komiyunity+Background')" }}></div> {/* Placeholder image */}
            <div className="absolute inset-0 bg-black/30 z-0"></div> {/* Dark overlay */}
            <div className="relative z-10 text-center w-full px-4">
                <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">Discover Your Next Komiyunity</h2>
                <div className="flex items-center bg-white/20 rounded-full px-5 py-3 shadow-inner border border-white/30 focus-within:border-indigo-400 transition-all duration-300 max-w-xl mx-auto">
                    <FiSearch size={24} className="text-gray-200 mr-4" />
                    <input
                        type="text"
                        placeholder="Search for a topic, #tag, or room name..."
                        value={roomSearchQuery}
                        onChange={(e) => setRoomSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent text-white text-lg placeholder-gray-300 outline-none border-none"
                        onKeyPress={(e) => { if (e.key === 'Enter') handleRoomSearch(); }}
                    />
                    <button
                        onClick={handleRoomSearch}
                        className="ml-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-semibold transition-colors duration-200 transform hover:scale-105"
                    >
                        Search
                    </button>
                </div>
                {searchRoomsResults.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-800/80 rounded-xl shadow-lg max-w-xl mx-auto">
                        <h4 className="text-lg font-semibold mb-3 text-indigo-200">Search Results:</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {searchRoomsResults.map(room => (
                                <div key={room.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg shadow-sm">
                                    <h5 className="text-md font-bold text-indigo-300">{room.name}</h5>
                                    <button
                                        onClick={() => handleJoinRoom(room.id)}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors duration-200"
                                    >
                                        Join
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </section>

          {/* Popular Rooms (SAFA-inspired "Trending Auctions" / Cards) */}
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-100">Popular Kommunities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {popularRooms.map(room => (
                <div key={room.id} className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden transform transition-transform duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => handleJoinRoom(room.id)}>
                  {/* Placeholder for Room Image - mimicking SAFA's square images */}
                  <div className="w-full h-36 bg-purple-600/30 flex items-center justify-center text-xl font-bold text-white text-center p-2">
                    {room.name.split(' ').map(n => n[0]).join('')} Community
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-white mb-1 truncate">{room.name}</h4>
                    <p className="text-gray-300 text-sm h-12 overflow-hidden">{room.description}</p>
                    <div className="mt-3 flex items-center justify-between text-gray-400 text-xs">
                      <span className="flex items-center"><FiUsers className="inline mr-1" /> {room.members} active</span>
                      <span className="flex items-center"><FiMessageSquare className="inline mr-1" /> {room.messages} msgs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* The compact Create New Room functionality could be part of a modal or a separate page,
              triggered by the "Start Komiyunity" button in the sidebar. */}
          {/* Removed the large create room form from here to match SAFA's less clutterd main content. */}
        </main>

        {/* Right Sidebar - Active Users in Related Topics (SAFA-inspired Balance List) */}
        <aside className="w-80 bg-gray-900 p-6 flex flex-col border-l border-gray-800 shadow-xl">
          {/* User Profile Summary - mimicking Octapa Sam's profile (can be for the logged-in user) */}
          <div className="p-4 bg-gray-800 rounded-xl shadow-md border border-gray-700 mb-6 flex flex-col items-center">
            <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 border-4 border-indigo-400">
              {userName.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-white">{userName}</h3>
            <p className="text-sm text-gray-400 mb-4">@{userName.toLowerCase().replace(/\s/g, '')}</p>
            <div className="flex justify-around w-full text-center">
              <div>
                <p className="text-lg font-bold text-white">25</p>
                <p className="text-xs text-gray-400">Rooms Joined</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">50</p>
                <p className="text-xs text-gray-400">Posts</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">120</p>
                <p className="text-xs text-gray-400">Interactions</p>
              </div>
            </div>
            <button className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200">
              View Profile
            </button>
          </div>

          {/* Active Users in Related Topics (SAFA Balance List) */}
          <div className="mb-8 p-4 bg-gray-800 rounded-xl shadow-md border border-gray-700">
            <h4 className="text-lg font-semibold mb-4 text-indigo-300">Active Users</h4>
            {activeUsers.length > 0 ? (
              <ul className="space-y-3">
                {activeUsers.map(user => (
                  <li key={user.id} className="flex items-center justify-between text-gray-300 text-md">
                    <div className="flex items-center">
                      <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 border border-purple-500">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[120px]">{user.name.split(' ')[0]}</span> {/* Show first name */}
                    </div>
                    {/* Status Dot */}
                    <span className={`w-2 h-2 rounded-full ${user.status === 'Online' ? 'bg-green-500' : user.status === 'Away' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                    <span className="text-gray-400 text-sm">{user.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No active users currently displayed.</p>
            )}
            <button className="mt-4 w-full text-center text-indigo-400 text-sm hover:text-indigo-300 transition-colors duration-200">
                See All Active Users
            </button>
          </div>

          {/* Trending Topics (SAFA-inspired) */}
          <div className="p-4 bg-gray-800 rounded-xl shadow-md border border-gray-700">
            <h4 className="text-lg font-semibold mb-3 text-indigo-300">Trending Topics</h4>
            <ul className="space-y-3">
              <li className="text-gray-300 text-sm hover:text-white cursor-pointer transition-colors duration-200">#AIethics</li>
              <li className="text-gray-300 text-sm hover:text-white cursor-pointer transition-colors duration-200">#SolidityDev</li>
              <li className="text-gray-300 text-sm hover:text-white cursor-pointer transition-colors duration-200">#SustainableLiving</li>
              <li className="text-gray-300 text-sm hover:text-white cursor-pointer transition-colors duration-200">#IndieGames</li>
            </ul>
          </div>

        </aside>
      </div>
    </div>
  );
}

export default HomePage;