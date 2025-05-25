// src/components/HomePage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiCompass, FiUsers, FiSettings, FiSearch, FiMessageSquare, FiPlus, FiBell, FiMail, FiChevronRight, FiGrid, FiDollarSign } from 'react-icons/fi';

function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [newRoomName, setNewRoomName, setNewRoomDescription] = useState('');
  const [newRoomDescription] = useState('');
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [searchRoomsResults, setSearchRoomsResults] = useState([]);
  const [searchUsersResults, setSearchUsersResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);

  // HARDCODED DUMMY DATA FOR UI DEMO - START
  const [popularRooms, setPopularRooms] = useState([
    { id: '1', name: 'Web Dev Wizards', description: 'Discussions on React, Node.js, and modern web tech.', members: 45, messages: 120, topics: ['web development', 'react', 'node.js'] },
    { id: '2', name: 'AI & ML Enthusiasts', description: 'Latest in AI, machine learning, and data science.', members: 32, messages: 85, topics: ['ai', 'machine learning', 'data science'] },
    { id: '3', name: 'Game Dev Dojo', description: 'Unity, Unreal, and indie game development chats.', members: 28, messages: 60, topics: ['game development', 'unity', 'unreal'] },
    { id: '4', name: 'Cybersecurity Hub', description: 'Defending against threats and ethical hacking.', members: 50, messages: 150, topics: ['cybersecurity', 'hacking', 'threats'] },
    { id: '5', name: 'IoT Innovators', description: 'Smart devices, automation, and connected tech.', members: 18, messages: 40, topics: ['iot', 'smart home', 'automation'] },
    { id: '6', name: 'Blockchain Basics', description: 'Exploring decentralized ledgers and crypto.', members: 40, messages: 110, topics: ['blockchain', 'crypto', 'web3'] },
    { id: '7', name: 'Anime Universe', description: 'Discussions on popular anime, manga, and new releases.', members: 60, messages: 200, topics: ['anime', 'manga', 'naruto', 'one piece', 'jujutsu kaisen'] },
    { id: '8', name: 'Movie Fanatics', description: 'Reviews, recommendations, and debates about movies.', members: 55, messages: 180, topics: ['movies', 'films', 'cinema', 'sci-fi'] },
  ]);

  const [allUsers, setAllUsers] = useState([
    { id: 'u1', name: 'Hardik Sati', status: 'Online', topics: ['react', 'web development', 'ui/ux'] },
    { id: 'u2', name: 'Deepanshu Kumar', status: 'Online', topics: ['ai', 'machine learning', 'python', 'naruto'] },
    { id: 'u3', name: 'Ankita Sharma', status: 'Offline', topics: ['game development', 'unity', 'animation'] },
    { id: 'u4', name: 'Rahul Gupta', status: 'Online', topics: ['cybersecurity', 'network security'] },
    { id: 'u5', name: 'Priya Singh', status: 'Online', topics: ['iot', 'smart home', 'embedded systems'] },
    { id: 'u6', name: 'Vikram Patel', status: 'Away', topics: ['blockchain', 'solidity', 'web3'] },
    { id: 'u7', name: 'Sneha Reddy', status: 'Online', topics: ['data science', 'ai', 'statistics'] },
    { id: 'u8', name: 'Nao Hoshino', status: 'Online', topics: ['anime', 'manga', 'jujutsu kaisen', 'illustration'] },
    { id: 'u9', name: 'Kenji Tanaka', status: 'Online', topics: ['anime', 'naruto', 'one piece', 'japanese culture'] },
    { id: 'u10', name: 'Mirnaal Dave', status: 'Online', topics: ['movies', 'sci-fi', 'film criticism', 'naruto'] },
    { id: 'u11', name: 'Chris Nolan', status: 'Offline', topics: ['movies', 'thriller', 'direction'] },
    { id: 'u12', name: 'Shreya Varma', status: 'Online', topics: ['web development', 'frontend', 'design'] },
    { id: 'u13', name: 'Amit Singh', status: 'Away', topics: ['blockchain', 'defi'] },
  ]);
  // HARDCODED DUMMY DATA FOR UI DEMO - END

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleStartKomiyunityClick = () => {
    alert("This button would open a modal or navigate to a 'Create Room' page!");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleJoinRoom = (room) => {
    setIsLoadingRoom(true);
    localStorage.setItem('currentRoomName', room.name);
    navigate(`/chat/${room.id}`);
  };

  const handleDirectMessage = (user) => {
    setIsLoadingRoom(true);
    const currentUserUid = localStorage.getItem('userUid');
    if (!currentUserUid) {
        console.error("Current user UID not found in localStorage. Cannot initiate DM.");
        navigate('/');
        return;
    }

    const dmRoomId = [currentUserUid, user.id].sort().join('_DM_');

    localStorage.setItem('currentRoomName', user.name);
    navigate(`/chat/${dmRoomId}`);
  };


  const handleRoomSearch = () => {
    if (roomSearchQuery.trim() === '') {
      setSearchRoomsResults([]);
      setSearchUsersResults([]);
      return;
    }

    const queryLower = roomSearchQuery.toLowerCase();

    // Filter Rooms
    const filteredRooms = popularRooms.filter(room =>
      room.name.toLowerCase().includes(queryLower) ||
      room.description.toLowerCase().includes(queryLower) ||
      room.topics.some(topic => topic.includes(queryLower))
    );
    setSearchRoomsResults(filteredRooms);

    // Filter Users based on topics or name
    const filteredUsers = allUsers.filter(user =>
      user.name.toLowerCase().includes(queryLower) ||
      user.topics.some(topic => topic.includes(queryLower))
    );
    setSearchUsersResults(filteredUsers);
  };

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 font-sans relative">
      {/* Loading Overlay */}
      {isLoadingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-white text-xl font-semibold">Entering room shortly...</p>
          </div>
        </div>
      )}

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
      <div className="flex flex-1 pt-16">
        {/* Left Sidebar - SAFA-inspired Dashboard Style */}
        <aside className="w-64 bg-gray-900 p-6 flex flex-col justify-between border-r border-gray-800 shadow-xl">
          <nav>
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center py-2 px-4 rounded-lg text-lg font-medium text-gray-300 hover:bg-gray-800 hover:text-indigo-400 transition-all duration-200">
                  <FiGrid className="mr-3 text-xl" /> Dashboard
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
              onClick={handleStartKomiyunityClick}
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
        <main className="flex-1 flex flex-col p-8 overflow-y-auto bg-gray-900">
          {/* Top Banner with Search Bar and Results */}
          {/* IMPORTANT: Removed fixed height (h-48, h-64) and added min-h-[192px] and flex-grow */}
          <section className="relative w-full bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl shadow-xl flex flex-col items-center mb-8 overflow-hidden pt-4 pb-8"> {/* Added pb-8 for bottom padding */}
            <div className="absolute inset-0 bg-cover bg-center opacity-30 z-0" style={{ backgroundImage: "url('https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=Komiyunity+Background')" }}></div>
            <div className="absolute inset-0 bg-black/30 z-0"></div>

            {/* Content within the banner (text, search bar, results) */}
            <div className="relative z-10 text-center w-full px-4 flex flex-col items-center">
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
            </div>

            {/* Search Results Area - Directly integrated into the banner's visual style */}
            {(searchRoomsResults.length > 0 || searchUsersResults.length > 0) && (
                <div className="relative z-10 w-full mt-6"> {/* Increased mt-6 for more space */}
                    {searchUsersResults.length > 0 && (
                        <>
                            <h4 className="text-lg font-semibold mt-2 mb-3 text-indigo-200 text-center">Komiyunity Members</h4>
                            {/* Flex container for user profiles - dynamic centering/left-alignment */}
                            <div className={`flex overflow-x-auto pb-2 gap-x-4 px-4 ${searchUsersResults.length <= 6 ? 'justify-center' : 'justify-start'} scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-700`}>
                                {searchUsersResults.map((user, index) => (
                                    <div
                                        key={user.id}
                                        className="flex flex-col items-center flex-shrink-0 cursor-pointer transition-transform duration-200 hover:scale-105"
                                        onClick={() => handleDirectMessage(user)}
                                    >
                                        {/* User Profile Circle */}
                                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-purple-950 shadow-md">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        {/* User Name */}
                                        <span className="text-sm text-gray-300 truncate w-16 text-center mt-1">{user.name.split(' ')[0]}</span>
                                    </div>
                                ))}
                                {/* "+n" circle if more users exist */}
                                {searchUsersResults.length > 6 && (
                                    <div className="flex flex-col items-center flex-shrink-0 cursor-pointer transition-transform duration-200 hover:scale-105">
                                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-gray-500">
                                            +{searchUsersResults.length - 6}
                                        </div>
                                        <span className="text-sm text-gray-300 w-16 text-center mt-1">More</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {searchRoomsResults.length > 0 && (
                        <>
                            <h4 className="text-lg font-semibold mt-6 mb-3 text-indigo-200 text-center">Kommunities:</h4> {/* Increased mt-6 */}
                            {/* Community results: No bg-gray-700, just aligned text and button */}
                            <div className="grid grid-cols-1 gap-2 max-w-xl mx-auto px-4"> {/* Smaller gap, max-w-xl, centered */}
                                {searchRoomsResults.map(room => (
                                    <div key={room.id} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-white/10 transition-colors duration-200">
                                        <h5 className="text-md font-bold text-gray-200">{room.name}</h5> {/* Changed text-indigo-300 to text-gray-200 */}
                                        <button
                                            onClick={() => handleJoinRoom(room)}
                                            className="px-4 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm  rounded-[30px] transition-colors duration-200"
                                        >
                                            Join
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {searchRoomsResults.length === 0 && searchUsersResults.length === 0 && (
                        <p className="text-gray-400 text-center mt-4">No results found for "{roomSearchQuery}".</p>
                    )}
                </div>
            )}
          </section>

          {/* Popular Rooms - This section remains below the main banner */}
          <section className="mb-8 mt-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-100">Popular Kommunities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {popularRooms.map(room => (
                <div key={room.id} className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden transform transition-transform duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => handleJoinRoom(room)}>
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
        </main>

        {/* Right Sidebar - Active Users & Trending Topics */}
        <aside className="w-80 bg-gray-900 p-6 flex flex-col border-l border-gray-800 shadow-xl">
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

          <div className="mb-8 p-4 bg-gray-800 rounded-xl shadow-md border border-gray-700">
            <h4 className="text-lg font-semibold mb-4 text-indigo-300">Active Users</h4>
            {allUsers.length > 0 ? (
              <ul className="space-y-3">
                {allUsers.map(user => (
                  <li key={user.id} className="flex items-center justify-between text-gray-300 text-md">
                    <div className="flex items-center">
                      <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 border border-purple-500">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[120px]">{user.name.split(' ')[0]}</span>
                    </div>
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