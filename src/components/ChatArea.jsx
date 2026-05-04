import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Image, FileText, Gift, GraduationCap, MessageSquare, ChevronRight, Reply } from 'lucide-react';
import { updateMessageReaction } from '../services/firebase';

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];
const ALL_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '💯', '😡', '🤔', '👀'];

const ChatArea = ({ messages, isSecretMode, isLoaded, currentAIResponse, onReply, onLoadMore, onImageClick, onRetryUpload, explicitLoad }) => {
  const [popupMenu, setPopupMenu] = useState(null);
  const [showFullEmojis, setShowFullEmojis] = useState(false);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [firstMessageId, setFirstMessageId] = useState(null);

  useLayoutEffect(() => {
    if (messages.length > 0) {
      const currentFirstMessageId = messages[0].id;

      if (firstMessageId !== currentFirstMessageId && firstMessageId !== null) {
        // Older messages loaded, preserve scroll position
        if (containerRef.current && containerRef.current.dataset.scrollHeight) {
          const prevScrollHeight = parseFloat(containerRef.current.dataset.scrollHeight);
          const scrollDiff = containerRef.current.scrollHeight - prevScrollHeight;
          containerRef.current.scrollTop += scrollDiff;
        }
      } else {
        // Only scroll to bottom on initial load, if near bottom, or if user just sent a message
        const isNearBottom = containerRef.current && (containerRef.current.scrollHeight - containerRef.current.scrollTop - containerRef.current.clientHeight < 150);
        const lastMsg = messages[messages.length - 1];
        const isMyMessage = lastMsg && (lastMsg.sender === 'me' || lastMsg.sender === 'user');
        
        if (firstMessageId === null || isNearBottom || isMyMessage) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }
      }
      
      setFirstMessageId(currentFirstMessageId);
      if (containerRef.current) {
        containerRef.current.dataset.scrollHeight = containerRef.current.scrollHeight;
      }
    } else {
      setFirstMessageId(null);
    }
  }, [messages, firstMessageId]);

  useEffect(() => {
    if (currentAIResponse) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentAIResponse]);

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && onLoadMore && messages.length >= 10) {
      onLoadMore();
    }
  };

  const handleContextMenu = (e, msg) => {
    if (!isSecretMode) return;
    e.preventDefault();
    setPopupMenu({
      messageId: msg.id,
      msg: msg
    });
    setShowFullEmojis(false);
  };

  const handleReaction = async (messageId, emoji) => {
    if (isSecretMode && messageId && !messageId.toString().startsWith('temp_')) {
       await updateMessageReaction("main_secret_room", messageId, emoji);
    }
    setPopupMenu(null);
  };

  const fakeRecents = [
    { id: 1, title: "Biology NCERT Revision Notes" },
    { id: 2, title: "Sleep schedule for students", active: true },
    { id: 3, title: "NEET 2026 Study Plan" },
    { id: 4, title: "Chemistry Organic Reactions Short Tricks" },
    { id: 5, title: "Physics Numericals Practice" }
  ];

  // Agar Secret Mode OFF hai, ya user ne abhi tak koi chat start nahi ki:
  if (!isSecretMode && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 bg-[#171717] text-white overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-8 mt-12">What can I help with?</h2>
        
        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          <button className="flex items-center gap-3 p-3 border border-[#3e3e3e] rounded-2xl hover:bg-[#2f2f2f] transition">
            <Image size={18} className="text-[#4caf50]" />
            <span className="text-sm text-gray-300">Create image</span>
          </button>
          <button className="flex items-center gap-3 p-3 border border-[#3e3e3e] rounded-2xl hover:bg-[#2f2f2f] transition">
            <FileText size={18} className="text-[#ff9800]" />
            <span className="text-sm text-gray-300">Summarize text</span>
          </button>
          <button className="flex items-center gap-3 p-3 border border-[#3e3e3e] rounded-2xl hover:bg-[#2f2f2f] transition">
            <Gift size={18} className="text-[#ec407a]" />
            <span className="text-sm text-gray-300">Surprise me</span>
          </button>
          <button className="flex items-center gap-3 p-3 border border-[#3e3e3e] rounded-2xl hover:bg-[#2f2f2f] transition">
            <GraduationCap size={18} className="text-[#42a5f5]" />
            <span className="text-sm text-gray-300">Get advice</span>
          </button>
        </div>

        {/* Fake Recents List */}
        <div className="w-full max-w-md mt-10">
          <p className="text-xs font-semibold text-gray-500 mb-4 tracking-wider uppercase">Recents</p>
          <div className="space-y-4">
            {fakeRecents.map((item) => (
              <div key={item.id} className="flex items-center justify-between group cursor-pointer">
                <span className="text-[15px] text-gray-300 group-hover:text-white">{item.title}</span>
                {item.active && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Agar Secret Mode ON hai aur messages load karne hain:
  return (
    <div 
      className="flex-1 flex flex-col bg-[#171717] overflow-y-auto p-4 space-y-6"
      ref={containerRef}
      onScroll={handleScroll}
    >
      {isSecretMode && !isLoaded ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-600">
           {/* Jab tak /load nahi likhegi, screen khali dikhegi */}
           <p className="text-sm italic">AI is ready. Ask anything...</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const isUser = msg.sender === 'me' || msg.sender === 'user';
          return (
          <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div 
              onContextMenu={(e) => handleContextMenu(e, msg)}
              className={`relative max-w-[80%] px-4 py-2 rounded-2xl text-[15px] cursor-pointer ${
              isUser 
              ? 'bg-[#2f2f2f] text-white' 
              : 'bg-transparent text-gray-200 border border-[#3e3e3e]'
            }`}>
              {/* Reply Reference */}
              {msg.replyTo && (
                <div className={`mb-2 p-2 rounded-xl text-xs border-l-2 ${isUser ? 'bg-[#3e3e3e] border-[#10a37f]' : 'bg-[#2f2f2f] border-[#10a37f]'}`}>
                  <span className="text-gray-300 line-clamp-1">{msg.replyTo}</span>
                </div>
              )}

              {msg.type === 'image' ? (
                <div className="flex flex-col items-end">
                  <img 
                    src={msg.content} 
                    alt="sent" 
                    onClick={() => onImageClick && onImageClick(msg.content)}
                    className={`rounded-xl max-w-full h-auto cursor-pointer transition-all ${
                      msg.status === 'uploading' ? 'opacity-60 blur-[2px] animate-pulse' : 
                      (!explicitLoad ? 'blur-lg opacity-80 hover:opacity-100' : 'hover:opacity-90')
                    }`} 
                  />
                  {msg.status === 'error' && (
                    <button 
                       onClick={(e) => { e.stopPropagation(); onRetryUpload && onRetryUpload(msg); }} 
                       className="mt-2 flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-semibold px-2 py-1 bg-red-400/10 rounded-md transition-colors"
                    >
                       ⚠️ Retry Upload
                    </button>
                  )}
                </div>
              ) : (
                <p>{msg.content}</p>
              )}

              {/* Reaction */}
              {msg.reaction && (
                <div className={`absolute -bottom-2 ${isUser ? 'left-0' : 'right-0'} bg-[#171717] border border-[#3e3e3e] rounded-full px-1.5 py-0.5 text-xs shadow-sm`}>
                  {msg.reaction}
                </div>
              )}
            </div>
          </div>
        )})
      )}
      
      {/* Groq AI Typing Animation/Placeholder */}
      {currentAIResponse && (
        <div className="flex justify-start">
           <div className="bg-transparent text-gray-200 border border-[#3e3e3e] px-4 py-2 rounded-2xl text-[15px]">
              <p>{currentAIResponse}</p>
           </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* Popup Menu (Reactions & Reply) */}
      {popupMenu && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setPopupMenu(null)}
          onContextMenu={(e) => { e.preventDefault(); setPopupMenu(null); }}
        >
          <div 
            className="bg-[#2f2f2f] border border-[#3e3e3e] rounded-2xl p-4 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex gap-3 items-center bg-[#1e1e1e] rounded-full px-3 py-2">
              {(showFullEmojis ? ALL_EMOJIS : COMMON_EMOJIS).map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => handleReaction(popupMenu.messageId, emoji)}
                  className="text-2xl hover:scale-125 transition-transform"
                >{emoji}</button>
              ))}
              {!showFullEmojis && (
                <button 
                  onClick={() => setShowFullEmojis(true)}
                  className="p-1 rounded-full bg-[#3e3e3e] hover:bg-[#565656]"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
              )}
            </div>
            {onReply && (
              <button 
                onClick={() => {
                  onReply(popupMenu.msg);
                  setPopupMenu(null);
                }}
                className="flex items-center gap-2 text-white bg-[#3e3e3e] py-2 px-4 rounded-xl hover:bg-[#565656] w-full justify-center transition-colors"
              >
                <Reply size={18} />
                Reply to Message
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;