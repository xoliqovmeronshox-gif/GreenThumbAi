import React, { useState } from 'react';
import { Leaf, MessageCircle, Camera, Flower2 } from 'lucide-react';
import ChatBot from './components/ChatBot';
import PlantAnalyzer from './components/PlantAnalyzer';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 text-gray-800 font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar (Desktop) / Header (Mobile) */}
      <nav className="md:w-64 flex-shrink-0 bg-emerald-900 text-white flex md:flex-col justify-between p-4 md:p-6 shadow-xl z-20">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-400 p-2 rounded-lg text-emerald-900 shadow-lg shadow-emerald-900/50">
            <Flower2 size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden md:block">GreenThumb AI</h1>
          <h1 className="text-xl font-bold tracking-tight md:hidden">GreenThumb</h1>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex flex-col gap-2 mt-10 space-y-1">
          <button
            onClick={() => setCurrentView(AppView.CHAT)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === AppView.CHAT
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-emerald-100 hover:bg-emerald-800/50'
            }`}
          >
            <MessageCircle size={20} />
            <span className="font-medium">Garden Chat</span>
          </button>
          
          <button
            onClick={() => setCurrentView(AppView.ANALYZE)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === AppView.ANALYZE
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-emerald-100 hover:bg-emerald-800/50'
            }`}
          >
            <Camera size={20} />
            <span className="font-medium">Identify Plant</span>
          </button>
        </div>

        <div className="hidden md:block mt-auto pt-6 border-t border-emerald-800 text-xs text-emerald-300">
          <p>© 2025 GreenThumb AI</p>
          <p className="mt-1">Created by Xoliqov Meronshox</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col h-[calc(100vh-64px)] md:h-screen p-4 md:p-6 overflow-hidden">
        <div className="h-full max-w-5xl mx-auto w-full">
           {currentView === AppView.CHAT ? <ChatBot /> : <PlantAnalyzer />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden bg-white border-t border-gray-200 flex justify-around p-2 pb-safe shadow-lg z-30">
        <button
          onClick={() => setCurrentView(AppView.CHAT)}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${
            currentView === AppView.CHAT ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400'
          }`}
        >
          <MessageCircle size={24} />
          <span className="text-xs font-medium">Chat</span>
        </button>
        <button
          onClick={() => setCurrentView(AppView.ANALYZE)}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${
            currentView === AppView.ANALYZE ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400'
          }`}
        >
          <Camera size={24} />
          <span className="text-xs font-medium">Identify</span>
        </button>
      </div>
    </div>
  );
};

export default App;