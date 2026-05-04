import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// Yaha 'doc' aur 'updateDoc' add kar diya hai
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, limitToLast } from "firebase/firestore";

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

export const subscribeToNewSessionMessages = (chatRoomId, callback) => {
  const q = query(
    collection(db, "chats", chatRoomId, "messages"),
    orderBy("timestamp", "asc"),
    limitToLast(10)
  );

  let isInitialLoad = true;
  return onSnapshot(q, (snapshot) => {
    if (isInitialLoad) {
      isInitialLoad = false;
      return;
    }

    const addedMessages = [];
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        addedMessages.push({
          id: change.doc.id,
          ...change.doc.data()
        });
      }
    });

    if (addedMessages.length > 0) {
      callback(addedMessages);
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