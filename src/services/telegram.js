import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

const BOT_TOKEN = "8279140270:AAGPaix58Ib039-01PRJQPgjy6koO8u3SeU";
const CHAT_ID = "7975542258";

export const sendTelegramAlert = async (actualMessage, senderName = "GF") => {
    // 1. Pehle Firebase se setting check karenge ki "hide" karna hai ya nahi
    let showContent = true; // Default
    try {
        const settingsSnap = await getDoc(doc(db, "settings", "notifications"));
        if (settingsSnap.exists()) {
            showContent = settingsSnap.data().showActualMessage;
        }
    } catch (e) {
        console.log("Using default notification mode");
    }

    // 2. Message decide karo (Actual ya Hidden)
    const finalMessage = showContent 
        ? `📩 *Message from ${senderName}:*\n\n${actualMessage}` 
        : `📩 *New Message Received from ${senderName}*`;

    // 3. Telegram ko bhejo
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: finalMessage,
            parse_mode: 'Markdown'
        }),
    });
};