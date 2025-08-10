import * as crypto from 'crypto';
import { handleRequest } from '@/services/axiosService';
import config from '@/config/envConfig';
import { Request } from 'express';
import { DepositRequestBody, WithdrawRequestBody } from '@/types/types/types.common';

const { SPEED_DEPOSIT_URL, HOOKDECK_SECRET, SPEED_WITHDRAWAL_URL } = config;

// Function to call the Speed API for deposits
export async function callDepositApi(authKey: string, body: DepositRequestBody) {
  try {
    const config = {
      method: 'POST',
      url: SPEED_DEPOSIT_URL,
      headers: {
        accept: 'application/json',
        'speed-version': '2022-10-15',
        'content-type': 'application/json',
        authorization: authKey, // Securely passing auth key
      },
      data: body,
    };

    // Call Speed API using handleRequest
    return await handleRequest(config);
  } catch (error) {
    console.log('>>>errors', (error as any).response.data.errors);
    if (error instanceof Error) {
      throw new Error(`Deposit API call failed: ${error.message}`, {
        cause: (error as any)?.response?.data?.errors || error,
      });
    }
  }
}

// Function to call the Speed API for deposits
export async function callWithdrawalApi(authKey: string, body: WithdrawRequestBody) {
  try {
    const config = {
      method: 'POST',
      url: SPEED_WITHDRAWAL_URL,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: authKey, // Securely passing auth key
      },
      data: JSON.stringify(body),
    };

    // Call Speed API using handleRequest
    return await handleRequest(config);
  } catch (error) {
    console.log('>>>errors', (error as any).response.data.errors);
    if (error instanceof Error) {
      const mainError: string =
        (error as any)?.response?.data?.errors[0]?.message || `Deposit API call failed: ${error.message}`;
      if (mainError.includes('Insufficient funds')) {
        throw new Error('Merchant does not have enough payment to cover this amount including fees', {
          cause: (error as any)?.response?.data?.errors || error,
        });
      } else {
        throw new Error(mainError, {
          cause: (error as any)?.response?.data?.errors || error,
        });
      }
    }
  }
}

// Function to verify the signature from Hook deck
export function verifyHookdeckSignature(req: Request): boolean {
  const hmacHeader = req.get('x-hookdeck-signature');
  const hmacHeader2 = req.get('x-hookdeck-signature-2');

  //Create a hash based on the parsed body
  const hash = crypto
    .createHmac('sha256', HOOKDECK_SECRET)
    .update(req.rawBody as unknown as crypto.BinaryLike)
    .digest('base64');

  // Compare the created hash with the value of the x-hook deck-signature and x-hook deck-signature-2 headers
  return Boolean(hash === hmacHeader || (hmacHeader2 && hash === hmacHeader2));
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
