// komiyunity/frontend/src/App.jsx
import React from 'react';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import ChatRoom from './ChatRoom'
// import ChatRoom from './ChatRoom'; // Keep this commented or remove for now, as LoginPage is active

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center"> {/* flex-grow to take available space, center content */}
        {/* <LoginPage /> Currently showing the LoginPage */}
       <ChatRoom /> {/* Uncomment this when you want to see the chat room */}
      </main>
    </div>
  );
}

export default App;