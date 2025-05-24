// komiyunity/frontend/src/components/LoginPage.jsx
import React from 'react';

function LoginPage() {
  return (
    <div className="flex items-center justify-center p-4"> {/* Removed min-h-screen as App.jsx now handles overall centering */}
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-sm w-full border border-white/20 text-white relative overflow-hidden"> {/* Translucent, blurred, rounded-xl */}
        {/* Decorative elements for techy feel - optional */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center text-white mb-6">Welcome to Komiyunity</h2> {/* White text for contrast */}
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
            <p className="text-sm text-white/70">
              Or
            </p>
            <button
              className="mt-2 w-full flex justify-center items-center py-2 px-4 border border-white/30 rounded-md shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:scale-105"
            >
              <img src="https://www.svgrepo.com/show/303108/google-icon-logo.svg" alt="Google logo" className="h-5 w-5 mr-2" />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;