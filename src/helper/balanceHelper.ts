import { Types } from 'mongoose';
import BalanceModel from '@/models/balance/balance.model';
import { addOrUpdateBalanceRecord } from './firebaseHelper';

/**
 * Create initial balance record for a new user
 * Creates a USD balance record with zero balance
 */
export const createInitialBalanceRecord = async (userId: Types.ObjectId): Promise<void> => {
  try {
    // Create initial USD balance record
    const initialBalance = new BalanceModel({
      userId,
      currency: 'usd',
      availableBalance: 0.0,
      withdrawableBalance: 0.0,
    });

    const savedBalance = await initialBalance.save();
    const balanceId = String(savedBalance._id);

    // Store balance data in Firebase (run in background without await)
    addOrUpdateBalanceRecord(userId.toString(), balanceId, {
      currency: savedBalance.currency,
      availableBalance: parseFloat(savedBalance.availableBalance.toString()),
      withdrawableBalance: parseFloat(savedBalance.withdrawableBalance.toString()),
      userId: userId.toString(),
      balanceId: balanceId,
    }).catch((error) => {
      // Log error but don't throw to prevent user creation from failing
      console.error('Failed to sync balance to Firebase:', error);
    });

    console.log(`Initial balance record created for user: ${userId}`);
  } catch (error) {
    console.error('Failed to create initial balance record:', error);
    // Don't throw error to prevent user creation from failing
  }
};

/**
 * Update balance record and sync to Firebase in background
 */
export const updateBalanceAndSync = async (
  balanceId: Types.ObjectId,
  userId: Types.ObjectId,
  updateData: {
    availableBalance?: number;
    withdrawableBalance?: number;
    currency?: string;
    last_txn_id?: Types.ObjectId;
  }
): Promise<void> => {
  try {
    const updatedBalance = await BalanceModel.findByIdAndUpdate(balanceId, updateData, { new: true });

    if (updatedBalance) {
      // Sync to Firebase in background (without await)
      addOrUpdateBalanceRecord(userId.toString(), balanceId.toString(), {
        currency: updatedBalance.currency,
        availableBalance: parseFloat(updatedBalance.availableBalance.toString()),
        withdrawableBalance: parseFloat(updatedBalance.withdrawableBalance.toString()),
        userId: userId.toString(),
        balanceId: balanceId.toString(),
        ...(updatedBalance.last_txn_id && { lastTransactionId: updatedBalance.last_txn_id.toString() }),
      }).catch((error) => {
        console.error('Failed to sync balance update to Firebase:', error);
      });
    }
  } catch (error) {
    console.error('Failed to update balance:', error);
    throw error;
  }
};

/**
 * Sync existing balance to Firebase (for manual sync operations)
 */
export const syncBalanceToFirebase = (
  userId: string,
  balanceId: string,
  balanceData: {
    currency: string;
    availableBalance: number;
    withdrawableBalance: number;
    lastTransactionId?: string;
  }
): void => {
  // Run in background without await
  addOrUpdateBalanceRecord(userId, balanceId, {
    ...balanceData,
    userId,
    balanceId,
  }).catch((error) => {
    console.error('Failed to sync balance to Firebase:', error);
  });
};
