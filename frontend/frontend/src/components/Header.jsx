// komiyunity/frontend/src/components/Header.jsx
import React from 'react';

function Header() {
  return (
    <header className="bg-white/10 backdrop-blur-sm text-white p-4 shadow-xl border-b border-white/20 z-10"> {/* Translucent, blurred, sharper shadow, subtle border */}
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Komiyunity</h1>
        <nav>
          <a href="#" className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition duration-200">Home</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;