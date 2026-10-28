import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function createNotification({ recipientId, senderName, itemTitle, type }) {
  if (!recipientId) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      recipientId,
      message: type === 'save' 
        ? `${senderName || 'Someone'} saved your item "${itemTitle}"` 
        : `${senderName || 'A buyer'} is inquiring about your item "${itemTitle}"`,
      type,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}