import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { auth, loginWithGoogle, logoutUser, sendMessage, subscribeToMessages } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { encryptMessage, decryptMessage } from './services/crypto';
import { sendTelegramAlert } from './services/telegram';
import { uploadImageToImgBB } from './services/imgbb';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import InputBar from './components/InputBar';
import Auth from './components/Auth';
import CameraModal from './components/CameraModal';
import axios from 'axios';

// --- WHITELIST CONFIGURATION ---
const AUTHORIZED_EMAILS = [
  "pankajkushwaha20093@gmail.com",
  "strimoflow@gmail.com"
];

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSecretMode, setIsSecretMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [replyToMsg, setReplyToMsg] = useState(null);
  const [messageLimit, setMessageLimit] = useState(10);
  const [previewImage, setPreviewImage] = useState(null);

  const inputBarRef = useRef(null);
  const isInternalAction = useRef(false);
  const activeBlobUrls = useRef(new Set());

  // 1. AUTHENTICATION LOGIC
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && AUTHORIZED_EMAILS.includes(currentUser.email)) {
        setUser(currentUser);
      } else if (currentUser) {
        auth.signOut();
        setUser(null);
      } else {
        setUser(null);
      }
    });
    
    // Cleanup any lingering blob URLs on unmount
    const currentActiveBlobs = activeBlobUrls.current;
    return () => {
      unsubscribe();
      currentActiveBlobs.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  // 2. PANIC SWITCH (Critical Security)
  useEffect(() => {
    const handlePanic = () => {
      if (isInternalAction.current) return;
      
      setIsSecretMode(false);
      setIsLoaded(false);
      setMessages([]); // Clear RAM
      setReplyToMsg(null);
      
      // Cleanup preview and active blobs
      setPreviewImage(prev => {
        if (prev && prev.startsWith('blob:')) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      activeBlobUrls.current.forEach(url => URL.revokeObjectURL(url));
      activeBlobUrls.current.clear();
      setMessageLimit(10);
      setAiLoading(false);
      setIsCameraOpen(false);
      if (inputBarRef.current) {
        inputBarRef.current.clearInput(); // Clear typed saboot
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") handlePanic();
    };

    const onFocus = () => {
      // Reset after a short delay if returning from file picker
      if (isInternalAction.current) {
        setTimeout(() => { isInternalAction.current = false; }, 500);
      }
    };

    window.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", handlePanic);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", handlePanic);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // 3. SECRET CHAT SYNC (Firebase)
  useEffect(() => {
    let unsubscribe;
    if (user && isSecretMode && isLoaded) {
      unsubscribe = subscribeToMessages("main_secret_room", messageLimit, (rawMsgs) => {
        const decrypted = rawMsgs.map(m => ({
          ...m,
          content: decryptMessage(m.content),
          replyTo: m.replyTo ? decryptMessage(m.replyTo) : null
        }));
        setMessages(decrypted);
      });
    }
    return () => unsubscribe && unsubscribe();
  }, [user, isSecretMode, isLoaded, messageLimit]);

  // 4. MASTER ACTION HANDLER
  const handleMainAction = async (text) => {
    // Commands Logic
    if (text === '/chat') {
      setIsSecretMode(true);
      if (inputBarRef.current) inputBarRef.current.clearInput();
      return;
    }
    if (text === '/load' && isSecretMode) {
      setIsLoaded(true);
      setMessageLimit(10);
      if (inputBarRef.current) inputBarRef.current.clearInput();
      return;
    }
    if (text === '/back') {
      setIsSecretMode(false);
      setIsLoaded(false);
      setMessages([]);
      setReplyToMsg(null);
      setMessageLimit(10);
      if (inputBarRef.current) inputBarRef.current.clearInput();
      return;
    }

    // Processing Messages
    if (isSecretMode) {
      // Local Feedback (Immediate Display)
      const currentReplyContent = replyToMsg ? (replyToMsg.type === 'image' ? '📸 Image' : replyToMsg.content) : null;

      const tempMsg = {
        id: 'temp_' + Date.now(),
        sender: 'me',
        content: text,
        type: 'text',
        replyTo: currentReplyContent
      };

      setMessages(prev => [...prev, tempMsg]);

      // External Alert & DB Save
      sendTelegramAlert(text, user.displayName);
      const encrypted = encryptMessage(text);
      const replyEncrypted = currentReplyContent ? encryptMessage(currentReplyContent) : null;

      await sendMessage("main_secret_room", "me", encrypted, "text", replyEncrypted);
      setReplyToMsg(null);
    }
    else {
      // NORMAL AI MODE (Groq)
      setAiLoading(true);
      try {
        const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are ChatGPT by OpenAI. Stay in character. Never mention Groq." },
            { role: "user", content: text }
          ]
        }, {
          headers: { 'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}` }
        });

        const aiMsg = res.data.choices[0].message.content;
        setMessages(prev => [...prev, { sender: 'user', content: text }, { sender: 'ai', content: aiMsg }]);
      } catch (err) {
        // silently fail or handle error without logging secret
      } finally {
        setAiLoading(false);
      }
    }
  };

  // 5. CAMERA HANDLER & ERROR HANDLER
  const handlePlusFeatureError = () => {
    setMessages(prev => [...prev, { 
      id: 'error_' + Date.now(), 
      sender: 'ai', 
      content: 'Image analysis is a Plus feature. Please upgrade or use text mode.', 
      type: 'error' 
    }]);
  };

  const performImageUpload = async (messageId, mediaFile, localUrl) => {
    try {
      const uploadResult = await uploadImageToImgBB(mediaFile);
      
      if (uploadResult && isSecretMode) {
        sendTelegramAlert(`📸 Sent a Photo: ${uploadResult}`, user.displayName);
        const encryptedUrl = encryptMessage(uploadResult);
        await sendMessage("main_secret_room", "me", encryptedUrl, "image");

        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, status: 'success', content: uploadResult } : m
        ));

        if (typeof mediaFile !== 'string' && localUrl) {
          URL.revokeObjectURL(localUrl);
          activeBlobUrls.current.delete(localUrl);
        }
      } else {
        throw new Error("Upload failed or not in secret mode");
      }
    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, status: 'error' } : m
      ));
    }
  };

  const handleCapture = async (mediaFile) => {
    setIsCameraOpen(false);
    setTimeout(() => { isInternalAction.current = false; }, 500);

    // Immediate Local Feedback
    const localPreviewUrl = typeof mediaFile === 'string' ? mediaFile : URL.createObjectURL(mediaFile);
    if (typeof mediaFile !== 'string') {
      activeBlobUrls.current.add(localPreviewUrl);
    }
    
    const tempId = 'temp_img_' + Date.now();
    const tempMsg = {
      id: tempId,
      sender: 'me',
      type: 'image',
      content: localPreviewUrl,
      status: 'uploading',
      mediaFile: mediaFile
    };
    
    setMessages(prev => [...prev, tempMsg]);

    // Start upload in background
    performImageUpload(tempId, mediaFile, localPreviewUrl);
  };

  const handleRetryUpload = (msg) => {
    if (!msg.mediaFile) return;
    setMessages(prev => prev.map(m => 
      m.id === msg.id ? { ...m, status: 'uploading' } : m
    ));
    performImageUpload(msg.id, msg.mediaFile, msg.content);
  };

  if (!user) return <Auth onLogin={loginWithGoogle} />;

  return (
    <div className="flex flex-col h-screen bg-[#171717] overflow-hidden">
      <Header 
        userProfile={{ name: user.displayName, email: user.email }} 
        isSecretMode={isSecretMode} 
        onLogout={handleLogout} 
      />

      <ChatArea
        messages={messages}
        isSecretMode={isSecretMode}
        isLoaded={isLoaded || (isSecretMode && messages.length > 0)}
        explicitLoad={isLoaded}
        currentAIResponse={aiLoading ? "Processing..." : null}
        onReply={(msg) => setReplyToMsg(msg)}
        onLoadMore={() => setMessageLimit(prev => prev + 10)}
        onImageClick={(url) => setPreviewImage(url)}
        onRetryUpload={handleRetryUpload}
      />

      <InputBar
        ref={inputBarRef}
        onSendMessage={handleMainAction}
        onCameraTrigger={() => {
          isInternalAction.current = true;
          setIsCameraOpen(true);
        }}
        onFileUpload={handleCapture}
        onPlusFeatureError={handlePlusFeatureError}
        onInternalActionStart={() => { isInternalAction.current = true; }}
        replyToMsg={replyToMsg}
        onCancelReply={() => setReplyToMsg(null)}
        isSecretMode={isSecretMode}
      />

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => {
          setIsCameraOpen(false);
          setTimeout(() => { isInternalAction.current = false; }, 500);
        }}
        onCapture={handleCapture}
      />

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 transition-colors" onClick={() => setPreviewImage(null)}>
            <X size={28} />
          </button>
          <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain p-4" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export default App;