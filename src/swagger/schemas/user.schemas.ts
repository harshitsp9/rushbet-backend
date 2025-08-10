/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique user identifier
 *           example: "64f5b8e7d4c2a1b2c3d4e5f7"
 *         username:
 *           type: string
 *           description: User's unique username
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john@example.com"
 *         country:
 *           type: string
 *           description: User's country code (ISO 3166-1 alpha-3)
 *           example: "USA"
 *         authProvider:
 *           type: string
 *           enum: [email, telegram]
 *           description: Authentication provider used
 *           example: "email"
 *         isEmailVerified:
 *           type: boolean
 *           description: Email verification status
 *           example: false
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: User account status
 *           example: "active"
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *           example: "2024-01-15T11:30:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9_]+$'
 *           description: Optional username (auto-generated if not provided)
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 100
 *           description: Valid email address
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           maxLength: 128
 *           pattern: '^(?=.*[A-Za-z])(?=.*\d)'
 *           description: Password with at least one letter and one number
 *           example: "SecurePass123"
 *         country:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *           pattern: '^[A-Z]{3}$'
 *           description: Optional country code in ISO 3166-1 alpha-3 format
 *           example: "USA"
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           description: User's password
 *           example: "SecurePass123"
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Valid refresh token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY1YjhlN2Q0YzJhMWIyYzNkNGU1ZjciLCJzZXNzaW9uSWQiOiI2NGY1YjhlN2Q0YzJhMWIyYzNkNGU1ZjgiLCJpYXQiOjE2ODk4NzIzNjAsImV4cCI6MTY5MjQ2NDM2MH0.abc123def456"
 *
 *     TelegramLoginRequest:
 *       type: object
 *       required:
 *         - telegramId
 *       properties:
 *         telegramId:
 *           type: string
 *           description: Telegram user ID
 *           example: "123456789"
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9_]+$'
 *           description: Optional username
 *           example: "john_telegram"
 *         email:
 *           type: string
 *           format: email
 *           description: Optional email address
 *           example: "john@example.com"
 *         country:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *           pattern: '^[A-Z]{3}$'
 *           description: Optional country code in ISO 3166-1 alpha-3 format
 *           example: "USA"
 *
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john@example.com"
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john@example.com"
 *         otp:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *           pattern: '^\d{6}$'
 *           description: 6-digit OTP code
 *           example: "123456"
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           maxLength: 128
 *           pattern: '^(?=.*[A-Za-z])(?=.*\d)'
 *           description: New password with at least one letter and one number
 *           example: "NewSecurePass123"
 *
 *     VerifyEmailRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john@example.com"
 *         otp:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *           pattern: '^\d{6}$'
 *           description: 6-digit OTP code
 *           example: "123456"
 *
 *     AuthResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token (expires in 1 day)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY1YjhlN2Q0YzJhMWIyYzNkNGU1ZjciLCJzZXNzaW9uSWQiOiI2NGY1YjhlN2Q0YzJhMWIyYzNkNGU1ZjgiLCJpYXQiOjE2ODk4NzIzNjAsImV4cCI6MTY4OTk1ODc2MH0.abc123def456"
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token (expires in 30 days)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY1YjhlN2Q0YzJhMWIyYzNkNGU1ZjciLCJzZXNzaW9uSWQiOiI2NGY1YjhlN2Q0YzJhMWIyYzNkNGU1ZjgiLCJpYXQiOjE2ODk4NzIzNjAsImV4cCI6MTY5MjQ2NDM2MH0.xyz789uvw012"
 *
 *     TokenResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New JWT access token (expires in 1 day)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY1YjhlN2Q0YzJhMWIyYzNkNGU1ZjciLCJzZXNzaW9uSWQiOiI2NGY1YjhlN2Q0YzJhMWIyYzNkNGU1ZjgiLCJpYXQiOjE2ODk4NzIzNjAsImV4cCI6MTY4OTk1ODc2MH0.new123token456"
 *                 refreshToken:
 *                   type: string
 *                   description: New JWT refresh token (expires in 30 days)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY1YjhlN2Q0YzJhMWIyYzNkNGU1ZjciLCJzZXNzaW9uSWQiOiI2NGY1YjhlN2Q0YzJhMWIyYzNkNGU1ZjgiLCJpYXQiOjE2ODk4NzIzNjAsImV4cCI6MTY5MjQ2NDM2MH0.new789refresh012"
 *
 *     OTPResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 expiresIn:
 *                   type: string
 *                   description: OTP expiration time
 *                   example: "5 minutes"
 *
 *     ValidationErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ValidationError'
 *               example:
 *                 - type: "field"
 *                   msg: "Please provide a valid email address"
 *                   path: "email"
 *                   location: "body"
 */
