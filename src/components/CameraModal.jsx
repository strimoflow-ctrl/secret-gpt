import React, { useRef, useState } from 'react';
import { X, RefreshCw } from 'lucide-react';

const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Camera Shuru Karo
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }, // Front camera default
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied or not available.");
    }
  };

  // Photo Khincho
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Photo ko Base64 string mein badlo (Gallery mein save nahi hogi)
    const data = canvas.toDataURL('image/jpeg');
    setLoading(true);
    onCapture(data); // App.js ko bhej do upload ke liye
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      {/* Top Bar */}
      <div className="absolute top-0 w-full flex justify-between p-6 text-white z-10">
        <button onClick={onClose}><X size={28} /></button>
        <span className="text-sm font-medium">Capture Photo</span>
        <button onClick={startCamera}><RefreshCw size={24} /></button>
      </div>

      {/* Camera View */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
        onCanPlay={() => videoRef.current.play()}
      />

      {/* Capture Button */}
      <div className="absolute bottom-10 w-full flex justify-center">
        <button 
          onClick={capturePhoto}
          className="w-20 h-20 bg-white rounded-full border-4 border-gray-400 flex items-center justify-center active:scale-90 transition"
        >
          <div className="w-16 h-16 rounded-full border-2 border-black"></div>
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
          Uploading...
        </div>
      )}
    </div>
  );
};

export default CameraModal;