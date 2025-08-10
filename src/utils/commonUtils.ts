import mongoose from 'mongoose';
import * as crypto from 'crypto';

interface RequestBody {
  [key: string]: string | boolean | object | number;
}

export const generateRandomToken = (length: number = 16): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  const timestamp = Date.now(); // Get current timestamp in milliseconds

  return `${randomString}-${timestamp}`;
};

export function generateStringToSign(requestBody: RequestBody, secretKey: string): string {
  // Remove 'sign' key from the requestBody as it's not part of the string to sign
  const { ...sortedBody } = requestBody;
  delete sortedBody.sign;
  // Sort keys alphabetically
  const sortedKeys = Object.keys(sortedBody).sort();

  // Create the string by concatenating the key-value pairs
  let stringToSign = '';
  sortedKeys.forEach((key) => {
    const value = sortedBody[key];

    // If value is an object (like 'game_config' or 'info'), convert it to a JSON string
    if (typeof value === 'object') {
      stringToSign += `${key}${JSON.stringify(value)}`;
    } else if (typeof value === 'boolean') {
      stringToSign += `${key}${Number(value)}`;
    } else if (value !== undefined) {
      stringToSign += `${key}${value}`;
    }
  });

  // Append the secret key at the end
  stringToSign = stringToSign + secretKey;
  const sha1Hash = crypto.createHash('sha1').update(stringToSign).digest('hex');
  return sha1Hash;
}

export function generateSignatureForBetCore(data: { [key: string]: any }, privateKey: string): string {
  const dataToSign = { ...data };
  delete dataToSign.si; // Remove the 'si' field from the data

  const jsonString: string = JSON.stringify(dataToSign);
  const stringToHash: string = jsonString + privateKey;

  const md5Hash = crypto.createHash('md5').update(stringToHash).digest();
  return md5Hash.toString('base64');
}

export function calculateMD5Hash(reqBody: object): string {
  // Convert the request body to a string (assuming it's JSON)
  const bodyString: string = JSON.stringify(reqBody);

  // Calculate the MD5 hash of the resulting string
  const hash: string = crypto.createHash('md5').update(bodyString).digest('hex');

  return hash;
}

/**
 * Generates a mongoose ObjectId from a given id.
 * @param id - The id to convert to ObjectId.
 * @returns The generated ObjectId.
 */
export const generateObjectId = <T>(id: T): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(id as any);
};

/**
 * Ensures the given URL ends with a slash (/) and appends the provided path.
 * @param url - The base URL to check.
 * @param path - The path to append to the base URL.
 * @returns The formatted URL with the appended path.
 */
export const ensureTrailingSlashAndAppendPath = (url: string, path: string): string => {
  // Ensure the URL ends with a slash (/)
  if (!url?.endsWith('/')) {
    url += '/';
  }

  // Concatenate the path
  return url + path;
};

export function extractDomainFromEmail(email: string) {
  return email.split('@')[1]; // Get the part after '@'
}

export function showFormattedBalanceMultipler(amount: number | string, decimals: number | undefined = 0) {
  const balanceNumber = typeof amount === 'string' ? parseFloat(amount) : amount;

  const multiplier = Math.pow(10, decimals);

  // Multiply by 100 and return the result
  return parseFloat((balanceNumber * multiplier).toFixed(0));
}

export function showFormattedBalanceDivider(amount: number | string, decimals: number | undefined = 0) {
  const balanceNumber = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Create the divisor based on the number of decimal places
  const divisor = Math.pow(10, decimals);

  // Divide by the dynamic divisor and return the result
  return parseFloat((balanceNumber / divisor).toFixed(decimals));
}

export function formattedBalance(amount: number | string | mongoose.Types.Decimal128 = 0) {
  const balanceNumber =
    typeof amount === 'string'
      ? parseFloat(amount)
      : typeof amount === 'object'
        ? parseFloat(amount.toString())
        : amount;

  return parseFloat(balanceNumber.toFixed(2));
}
