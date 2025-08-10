// Extend the Express Request interface to include custom properties
declare namespace Express {
  interface Request {
    userId?: string;
    userName?: string;
  }
}
