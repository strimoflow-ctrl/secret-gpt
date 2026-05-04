import React, { useState } from 'react';
import { Menu, Search, Sparkles, MessageSquare, User, Settings, HelpCircle, LogOut } from 'lucide-react';

const Header = ({ userProfile, isSecretMode, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#171717] text-white sticky top-0 z-50">
      {/* Left Side: Menu Icon and App Name */}
      <div className="flex items-center gap-4">
        <button className="p-1 hover:bg-[#2f2f2f] rounded-lg transition">
          <Menu size={24} strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-1 cursor-pointer group">
          <h1 className="text-xl font-medium tracking-tight">ChatGPT</h1>
          <span className="text-[#9b9b9b] mt-1 tracking-tighter">▼</span>
        </div>
      </div>

      {/* Right Side: Search and Profile */}
      <div className="flex items-center gap-4">
        <button className="p-1 hover:bg-[#2f2f2f] rounded-lg transition">
          <Search size={22} strokeWidth={1.5} />
        </button>
        
        {/* Profile Circle (PA jaisa dikhega) */}
        <div className="relative">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full bg-[#3e5a67] flex items-center justify-center text-[12px] font-semibold text-white border border-[#565656] cursor-pointer hover:opacity-80 transition"
          >
            {userProfile && userProfile.name ? userProfile.name.substring(0, 2).toUpperCase() : 'PA'}
          </div>
          
          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute top-10 right-0 bg-[#2f2f2f] rounded-xl w-56 shadow-xl border border-[#3e3e3e] z-50 overflow-hidden text-[14px] animate-in fade-in zoom-in-95 duration-200">
              {/* User Email */}
              <div className="px-3 py-2 text-[#b4b4b4] text-xs border-b border-[#3e3e3e] break-all">
                {userProfile?.email || 'user@example.com'}
              </div>
              
              <div className="py-1 border-b border-[#3e3e3e]">
                <button type="button" onClick={() => setShowProfileMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-white hover:bg-[#3e3e3e] transition">
                  <Sparkles size={16} />
                  <span>Upgrade plan</span>
                </button>
                <button type="button" onClick={() => setShowProfileMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-white hover:bg-[#3e3e3e] transition">
                  <MessageSquare size={16} />
                  <span>Personalization</span>
                </button>
                <button type="button" onClick={() => setShowProfileMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-white hover:bg-[#3e3e3e] transition">
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button type="button" onClick={() => setShowProfileMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-white hover:bg-[#3e3e3e] transition">
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
              </div>
              
              <div className="py-1">
                <button type="button" onClick={() => setShowProfileMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-white hover:bg-[#3e3e3e] transition">
                  <HelpCircle size={16} />
                  <span>Help</span>
                </button>
                <button type="button" onClick={() => { setShowProfileMenu(false); onLogout && onLogout(); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[#ff6b6b] hover:bg-[#3e3e3e] transition">
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Secret Indicator (Ye sirf tumhe dikhega, 
          ek chota sa 1px ka dot jo notification ka kaam karega) */}
      {isSecretMode && (
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-transparent">
            {/* Jab message aayega tab iska color halka sa change hoga */}
            <div className="w-[2px] h-[2px] bg-[#2f2f2f] mx-auto"></div>
        </div>
      )}
    </header>
  );
};

export default Header;