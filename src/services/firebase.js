import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// Yaha 'doc' aur 'updateDoc' add kar diya hai
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, limitToLast, limit, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHG8jahQyjKMBBjB0Pfl5vO7_kouRrtDo",
  authDomain: "secret-gpt.firebaseapp.com",
  projectId: "secret-gpt",
  storageBucket: "secret-gpt.firebasestorage.app",
  messagingSenderId: "421414243386",
  appId: "1:421414243386:web:a2b2e5a4173303d51b7903"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logoutUser = () => signOut(auth);

export const db = getFirestore(app);

export const sendMessage = async (chatRoomId, senderId, senderEmail, text, type = 'text', replyTo = null) => {
  try {
    await addDoc(collection(db, "chats", chatRoomId, "messages"), {
      sender: senderId,
      senderEmail: senderEmail,
      content: text,
      type: type,
      replyTo: replyTo,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message: ", error);
  }
};

export const subscribeToMessages = (chatRoomId, limitCount, callback) => {
  const q = query(
    collection(db, "chats", chatRoomId, "messages"),
    orderBy("timestamp", "asc"),
    limitToLast(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

export const updateLastRead = async (userEmail) => {
  try {
    await setDoc(doc(db, "user_reads", userEmail), {
      lastReadTimestamp: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating last read", error);
  }
};

export const subscribeToLastRead = (userEmail, callback) => {
  return onSnapshot(doc(db, "user_reads", userEmail), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().lastReadTimestamp);
    } else {
      callback(null);
    }
  });
};

export const subscribeToLatestMessage = (chatRoomId, callback) => {
  const q = query(
    collection(db, "chats", chatRoomId, "messages"),
    orderBy("timestamp", "desc"),
    limit(1)
  );

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      callback(snapshot.docs[0].data());
    } else {
      callback(null);
    }
  });
};

// Yaha se 'const { doc... }' wali line hata di hai kyunki wo upar import ho gaya hai
export const updateMessageReaction = async (chatRoomId, messageId, reaction) => {
  try {
    const messageRef = doc(db, "chats", chatRoomId, "messages", messageId);
    await updateDoc(messageRef, { reaction });
  } catch (error) {
    console.error("Error updating reaction: ", error);
  }
};