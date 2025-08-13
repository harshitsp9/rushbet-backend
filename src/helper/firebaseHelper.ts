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

// Common function to add or update balance record
export async function addOrUpdateBalanceRecord(accId: string, balanceId: string, balanceData: any) {
  accId = String(accId);
  balanceId = String(balanceId);
  const balanceRef = firebaseDatabase.collection('account').doc(accId).collection('balance').doc(balanceId);

  // Check if the deposit document exists
  const doc = await balanceRef.get();

  if (doc.exists) {
    // Update the document if it exists
    await balanceRef.update({
      ...balanceData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Automatically add update timestamp
    });
  } else {
    // Create a new document if it doesn't exist
    await balanceRef.set({
      ...balanceData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Automatically add creation timestamp
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Automatically add creation timestamp
    });
  }
}
