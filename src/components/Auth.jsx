import React, { useState } from 'react';
import { X, Phone } from 'lucide-react';

const Auth = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleFakeSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setError("Email login is temporarily down. Please use Google Login.");
      setTimeout(() => setError(''), 3000); // 3 sec baad error gayab
    }
  };

  const handleOtherClick = () => {
    setError("Service unavailable in your region. Try another method.");
    setTimeout(() => setError(''), 3000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#000000] p-4 font-sans">
      {/* Modal Container */}
      <div className="relative w-full max-w-[440px] bg-[#171717] rounded-[24px] p-8 border border-[#2f2f2f] shadow-2xl">
        
        {/* Close Button (X) */}
        <button className="absolute right-6 top-6 text-[#8e8e8e] hover:text-white transition">
          <X size={24} strokeWidth={1.5} />
        </button>

        {/* Header */}
        <div className="text-center mt-4">
          <h2 className="text-[30px] font-semibold text-white tracking-tight">Log in or sign up</h2>
          <p className="text-[#b4b4b4] text-[15px] mt-4 px-4 leading-relaxed">
            You'll get smarter responses and can upload files, images, and more.
          </p>
        </div>

        {/* Login Buttons */}
        <div className="mt-10 space-y-3">
          {/* Google Login (Only this works) */}
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 bg-transparent border border-[#565656] text-white py-[14px] rounded-full font-medium text-[15px] hover:bg-[#2f2f2f] transition-all"
          >
            <svg viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continue with Google
          </button>

          {/* Apple ID (Fake Error) */}
          <button 
            onClick={handleOtherClick}
            className="w-full flex items-center justify-center gap-3 bg-transparent border border-[#565656] text-white py-[14px] rounded-full font-medium text-[15px] hover:bg-[#2f2f2f] transition-all"
          >
            <svg viewBox="0 0 384 512" className="w-5 h-5 fill-white">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            Continue with Apple
          </button>

          {/* Phone Login (Fake Error) */}
          <button 
            onClick={handleOtherClick}
            className="w-full flex items-center justify-center gap-3 bg-transparent border border-[#565656] text-white py-[14px] rounded-full font-medium text-[15px] hover:bg-[#2f2f2f] transition-all"
          >
            <Phone size={20} className="text-white" />
            Continue with phone
          </button>
        </div>

        {/* Divider Line */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center px-2">
            <div className="w-full border-t border-[#2f2f2f]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span className="bg-[#171717] px-4 text-[#8e8e8e]">OR</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleFakeSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-[#171717] border border-[#565656] text-white py-4 px-5 rounded-xl outline-none focus:border-[#10a37f] transition-all"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-white text-black py-[14px] rounded-full font-semibold text-[15px] hover:bg-[#ececec] transition-all"
          >
            Continue
          </button>
        </form>

        {/* Error Message (Secret Alert) */}
        {error && (
          <div className="mt-4 text-red-500 text-xs text-center font-medium animate-pulse">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;