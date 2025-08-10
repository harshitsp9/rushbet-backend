// helper.ts

import { firebaseDatabase } from '@/utils/firebase';
import admin from 'firebase-admin';

// Common function to add or update deposit record
export async function addOrUpdateDepositRecord(accId: string, depositId: string, depositData: any) {
  try {
    accId = String(accId);
    depositId = String(depositId);
    const depositRef = firebaseDatabase.collection('account').doc(accId).collection('deposit').doc(depositId);

    // Check if the deposit document exists
    const doc = await depositRef.get();

    if (doc.exists) {
      // Update the document if it exists
      await depositRef.update({
        ...depositData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Automatically add update timestamp
      });
    } else {
      // Create a new document if it doesn't exist
      await depositRef.set({
        ...depositData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(), // Automatically add creation timestamp
        updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Automatically add creation timestamp
      });
    }
  } catch (error) {
    console.error('Error adding or updating deposit record:', error);
  }
}

// Common function to add or update deposit record
export async function addOrUpdateWithdrawRecord(accId: string, withdrawId: string, depositData: any) {
  accId = String(accId);
  withdrawId = String(withdrawId);
  const depositRef = firebaseDatabase.collection('account').doc(accId).collection('withdraw').doc(withdrawId);

  // Check if the deposit document exists
  const doc = await depositRef.get();

  if (doc.exists) {
    // Update the document if it exists
    await depositRef.update({
      ...depositData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Automatically add update timestamp
    });
  } else {
    // Create a new document if it doesn't exist
    await depositRef.set({
      ...depositData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Automatically add creation timestamp
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Automatically add creation timestamp
    });
  }
}

// Common function to add current paying record
export async function firebaseAddPlayingRecord(gameId: string, eventId: string, eventData: any) {
  const gameEventRef = firebaseDatabase.collection('games').doc(gameId).collection('events').doc(eventId);
  const commonEventRef = firebaseDatabase.collection('events').doc(eventId);

  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  // Create a new document if it doesn't exist
  await gameEventRef.set({
    ...eventData,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await commonEventRef.set({
    ...eventData,
    gameId: gameId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export async function maintainEventLimit(eventCollectionRef: admin.firestore.CollectionReference) {
  try {
    // Get all documents ordered by createdAt in ascending order
    const eventsSnapshot = await eventCollectionRef.orderBy('createdAt', 'asc').get();

    // If we have more than 20 documents
    if (eventsSnapshot.size > 20) {
      // Calculate how many documents to delete
      const docsToDelete = eventsSnapshot.size - 20;

      // Get the oldest documents to delete
      const oldestDocs = eventsSnapshot.docs.slice(0, docsToDelete);

      // Delete the oldest documents
      const deletePromises = oldestDocs.map((doc) => doc.ref.delete());
      await Promise.all(deletePromises);
    }
  } catch (error) {
    console.error('Error maintaining event limit:', error);
  }
}
