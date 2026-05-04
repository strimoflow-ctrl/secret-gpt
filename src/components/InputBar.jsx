import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Plus, Mic, AudioLines, ArrowUp, X, Paperclip, Image, Lightbulb, Globe, MoreHorizontal, Camera } from 'lucide-react';

const InputBar = forwardRef(({ onSendMessage, onCameraTrigger, onFileUpload, onPlusFeatureError, onInternalActionStart, replyToMsg, onCancelReply, isSecretMode }, ref) => {
  const [input, setInput] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    clearInput: () => setInput('')
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput(''); // Immediate UI clear on send for everything
      setShowPlusMenu(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  const handleCameraClick = () => {
    setShowPlusMenu(false);
    if (!isSecretMode) {
      if (onPlusFeatureError) onPlusFeatureError();
    } else {
      if (onInternalActionStart) onInternalActionStart();
      onCameraTrigger();
    }
  };

  const handleFileClick = () => {
    setShowPlusMenu(false);
    if (!isSecretMode) {
      if (onPlusFeatureError) onPlusFeatureError();
    } else {
      if (onInternalActionStart) onInternalActionStart();
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (onFileUpload) onFileUpload(file);
    }
    e.target.value = null;
  };

  return (
    <div className="bg-[#171717] px-4 pb-6 pt-2 w-full shrink-0 relative z-50">
      {replyToMsg && (
        <div className="flex items-center justify-between bg-[#2f2f2f] border-t border-x border-[#3e3e3e] rounded-t-[20px] px-4 py-2 mb-[-14px] pb-4 text-sm z-0 relative">
          <div className="flex flex-col">
            <span className="text-[#10a37f] font-semibold text-xs">Replying to</span>
            <span className="text-gray-300 truncate max-w-[200px]">
              {replyToMsg.type === 'image' ? '📸 Image' : replyToMsg.content}
            </span>
          </div>
          <button type="button" onClick={onCancelReply} className="text-gray-400 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Floating Plus Menu */}
      {showPlusMenu && (
        <div className="absolute bottom-full mb-2 left-4 bg-[#2f2f2f] rounded-[16px] p-2 flex flex-col gap-1 z-50 border border-[#3e3e3e] shadow-lg w-[220px]">
          <button type="button" onClick={handleFileClick} className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-[#3e3e3e] rounded-xl transition">
            <Paperclip size={18} />
            <span className="text-[15px] font-medium tracking-wide">Add photos & files</span>
          </button>
          <button type="button" onClick={handleCameraClick} className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-[#3e3e3e] rounded-xl transition">
            <Camera size={18} />
            <span className="text-[15px] font-medium tracking-wide">Camera</span>
          </button>
          <button type="button" onClick={() => setShowPlusMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-[#3e3e3e] rounded-xl transition">
            <Image size={18} />
            <span className="text-[15px] font-medium tracking-wide">Create image</span>
          </button>
          <button type="button" onClick={() => setShowPlusMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-[#3e3e3e] rounded-xl transition">
            <Lightbulb size={18} />
            <span className="text-[15px] font-medium tracking-wide">Thinking</span>
          </button>
          <button type="button" onClick={() => setShowPlusMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-[#3e3e3e] rounded-xl transition">
            <Globe size={18} />
            <span className="text-[15px] font-medium tracking-wide">Web search</span>
          </button>
          <button type="button" onClick={() => setShowPlusMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-[#3e3e3e] rounded-xl transition">
            <MoreHorizontal size={18} />
            <span className="text-[15px] font-medium tracking-wide">More</span>
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex items-center bg-[#2f2f2f] rounded-[28px] px-2 py-2 border border-[#3e3e3e] focus-within:border-[#565656] transition"
      >
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
        {/* Plus Button (Camera/Image sharing trigger) */}
        <button
          type="button"
          onClick={() => setShowPlusMenu(!showPlusMenu)}
          className={`p-2 transition rounded-full ${showPlusMenu ? 'bg-[#3e3e3e] text-white' : 'text-[#b4b4b4] hover:text-white'}`}
        >
          <Plus size={24} strokeWidth={1.5} className={showPlusMenu ? 'rotate-45 transition-transform' : 'transition-transform'} />
        </button>

        {/* Input Field */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask ChatGPT"
          className="flex-1 bg-transparent border-none outline-none text-white text-[16px] px-2 py-1 placeholder-[#8e8e8e]"
          autoComplete="new-password"
          spellCheck="false"
          data-lpignore="true"
          ref={inputRef}
        />

        {/* Right Side Icons */}
        <div className="flex items-center gap-1">
          {input.length > 0 ? (
            // Jab text likha ho to Send button (Arrow) dikhega
            <button
              type="submit"
              className="bg-white text-black p-1.5 rounded-full hover:bg-gray-200 transition"
            >
              <ArrowUp size={20} strokeWidth={2.5} />
            </button>
          ) : (
            // Jab khali ho to Mic aur Audio wave dikhegi (Real look)
            <>
              <button type="button" className="p-2 text-[#b4b4b4] hover:text-white transition">
                <Mic size={22} strokeWidth={1.5} />
              </button>
              <button type="button" className="p-2 text-[#b4b4b4] hover:text-white transition">
                <AudioLines size={22} strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </form>

      {/* Niche ek invisible buffer space taaki gesture bar ke upar rahe */}
      <div className="h-2"></div>
    </div>
  );
});

export default InputBar;