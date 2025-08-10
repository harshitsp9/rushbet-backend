import config from '@/config/envConfig';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthTokens, JwtPayloadFieldType } from '@/types/interfaces/interfaces.common';
import { JWTGenerateReturnType } from '@/types/types/types.common';

const { JWT_SECRET } = config;

// Function to generate JWT token
export const generateJwtToken = <T extends Partial<JwtPayloadFieldType>>(
  payload: T,
  expires?: string
): JWTGenerateReturnType => {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: expires || '1h',
  } as unknown as jwt.SignOptions);
  //refresh token
  return { token };
};

// Function to decode JWT token
export const decodeJwtToken = <T extends JwtPayloadFieldType & JwtPayload>(token: string): T | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as T;
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

// Function to verify JWT token
export const commonVerifyJwtToken = <T extends JwtPayloadFieldType & JwtPayload>(
  token: string,
  secret?: string,
  options?: jwt.VerifyOptions
): T | null => {
  try {
    // If secret is base64 encoded, decode it
    const secretKey = secret || JWT_SECRET;

    // Use provided options or create empty object
    const verifyOptions: jwt.VerifyOptions = options || {};

    return jwt.verify(token, secretKey, verifyOptions) as T;
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    return null;
  }
};

export function decodeJwtTokenForNotix(token: string): any {
  try {
    // Decode the token without verification first
    const decodedToken = jwt.decode(token, { complete: true });
    return decodedToken?.payload;

    // The public key in PEM format
    const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6S7asUuzq5Q/3U9rbs+P
kDVIdjgmtgWreG5qWPsC9xXZKiMV1AiV9LXyqQsAYpCqEDM3XbfmZqGb48yLhb/X
qZaKgSYaC/h2DjM7lgrIQAp9902Rr8fUmLN2ivr5tnLxUUOnMOc2SQtr9dgzTONY
W5Zu3PwyvAWk5D6ueIUhLtYzpcB+etoNdL3Ir2746KIy/VUsDwAM7dhrqSK8U2xF
CGlau4ikOTtvzDownAMHMrfE7q1B6WZQDAQlBmxRQsyKln5DIsKv6xauNsHRgBAK
ctUxZG8M4QJIx3S6Aughd3RZC4Ca5Ae9fd8L8mlNYBCrQhOZ7dS0f4at4arlLcaj
twIDAQAB
-----END PUBLIC KEY-----`;

    // Verify the token using the public key and the specified algorithm
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      complete: true,
      ignoreExpiration: true, // Temporarily ignore expiration for debugging
    });

    // Verify the token was signed with RS256
    if (decodedToken?.header?.alg !== 'RS256') {
      throw new Error('Token was not signed with RS256 algorithm');
    }

    // Return the decoded payload if verification is successful
    return decoded;
  } catch (error: any) {
    // Log the error to provide more information
    console.error('Error verifying token:', error.message);
    throw new Error('Token verification failed');
  }
}

//Hash password using bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

//Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateAuthTokens = <T extends Partial<JwtPayloadFieldType>>(payload: T): AuthTokens => {
  const accessToken = generateJwtToken(payload, '1d');
  const refreshToken = generateJwtToken(payload, '10d');
  const token = {
    accessToken: accessToken.token,
    refreshToken: refreshToken.token,
  };
  return token;
};
