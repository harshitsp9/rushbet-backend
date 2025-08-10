/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user with email and password
 *     description: |
 *       Creates a new user account with email authentication.
 *       - Username is optional and will be auto-generated if not provided
 *       - Password must contain at least one letter and one number
 *       - Country code is optional and must be in ISO 3166-1 alpha-3 format if provided
 *       - Sends a welcome email in background (won't crash server if email fails)
 *       - Returns both access token (1 day) and refresh token (30 days)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             with_username_and_country:
 *               summary: Registration with custom username and country
 *               value:
 *                 username: "john_doe"
 *                 email: "john@example.com"
 *                 password: "SecurePass123"
 *                 country: "USA"
 *             minimal_registration:
 *               summary: Minimal registration (email and password only)
 *               value:
 *                 email: "jane@example.com"
 *                 password: "MyPass456"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "User registered successfully"
 *               data:
 *                 user:
 *                   id: "64f5b8e7d4c2a1b2c3d4e5f7"
 *                   username: "john_doe"
 *                   email: "john@example.com"
 *                   country: "USA"
 *                   authProvider: "email"
 *                   isEmailVerified: false
 *                   status: "active"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               data:
 *                 - type: "field"
 *                   msg: "Password must contain at least one letter and one number"
 *                   path: "password"
 *                   location: "body"
 *       409:
 *         description: User already exists or username taken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               email_exists:
 *                 summary: Email already registered
 *                 value:
 *                   success: false
 *                   message: "User with this email already exists"
 *                   data: {}
 *               username_taken:
 *                 summary: Username already taken
 *                 value:
 *                   success: false
 *                   message: "Username is already taken"
 *                   data: {}
 *
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user with email and password
 *     description: |
 *       Authenticates user with email and password credentials.
 *       - Updates last login timestamp
 *       - Returns both access token (1 day) and refresh token (30 days)
 *       - Only works for users registered with email authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "john@example.com"
 *             password: "SecurePass123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 user:
 *                   id: "64f5b8e7d4c2a1b2c3d4e5f7"
 *                   username: "john_doe"
 *                   email: "john@example.com"
 *                   country: "USA"
 *                   authProvider: "email"
 *                   isEmailVerified: false
 *                   status: "active"
 *                   lastLogin: "2024-01-15T11:30:00.000Z"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Invalid credentials or wrong authentication method
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_credentials:
 *                 summary: Invalid email or password
 *                 value:
 *                   success: false
 *                   message: "Invalid email or password"
 *                   data: {}
 *               wrong_method:
 *                 summary: Wrong authentication method
 *                 value:
 *                   success: false
 *                   message: "Invalid login method. Please use the correct authentication method"
 *                   data: {}
 *       403:
 *         description: Account inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Account is inactive. Please contact support"
 *               data: {}
 *
 * /api/v1/auth/refresh-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token using refresh token
 *     description: |
 *       Generates new access and refresh tokens using a valid refresh token.
 *       - Refresh token must be valid and not expired (30 days)
 *       - Returns new access token (1 day) and new refresh token (30 days)
 *       - User account must be active
 *       - Invalidates the old refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *             example:
 *               success: true
 *               message: "Tokens refreshed successfully"
 *               data:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation failed or refresh token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   data:
 *                     - type: "field"
 *                       msg: "Refresh token is required"
 *                       path: "refreshToken"
 *                       location: "body"
 *               missing_token:
 *                 summary: Refresh token required
 *                 value:
 *                   success: false
 *                   message: "Refresh token is required"
 *                   data: {}
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid or expired refresh token"
 *               data: {}
 *       403:
 *         description: Account inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Account is inactive. Please contact support"
 *               data: {}
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "User not found"
 *               data: {}
 *
 * /api/v1/auth/telegram-login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login or register user with Telegram
 *     description: |
 *       Authenticates or creates a new user account using Telegram credentials.
 *       - If user exists with telegramId, logs them in
 *       - If user doesn't exist, creates a new account
 *       - Email and country are optional for Telegram users
 *       - Sends welcome email if email is provided
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TelegramLoginRequest'
 *           examples:
 *             full_telegram_login:
 *               summary: Telegram login with email and country
 *               value:
 *                 telegramId: "123456789"
 *                 username: "john_telegram"
 *                 email: "john@example.com"
 *                 country: "USA"
 *             minimal_telegram_login:
 *               summary: Minimal Telegram login (ID only)
 *               value:
 *                 telegramId: "987654321"
 *     responses:
 *       200:
 *         description: Telegram login successful (existing user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Telegram login successful"
 *               data:
 *                 user:
 *                   id: "64f5b8e7d4c2a1b2c3d4e5f8"
 *                   username: "john_telegram"
 *                   email: "john@example.com"
 *                   country: "USA"
 *                   authProvider: "telegram"
 *                   isEmailVerified: true
 *                   status: "active"
 *                   lastLogin: "2024-01-15T11:30:00.000Z"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       201:
 *         description: Telegram account created successfully (new user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Telegram account created successfully"
 *               data:
 *                 user:
 *                   id: "64f5b8e7d4c2a1b2c3d4e5f9"
 *                   username: "telegram_123456789"
 *                   email: null
 *                   country: null
 *                   authProvider: "telegram"
 *                   isEmailVerified: true
 *                   status: "active"
 *                   createdAt: "2024-01-15T11:30:00.000Z"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       409:
 *         description: Username or email already taken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Send OTP to email for password reset
 *     description: |
 *       Sends a 6-digit OTP to the user's email for password reset.
 *       - OTP expires in 5 minutes
 *       - Only works for users registered with email authentication
 *       - For security, always returns success even if email doesn't exist
 *       - Deactivates any existing password reset OTPs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *           example:
 *             email: "john@example.com"
 *     responses:
 *       200:
 *         description: OTP sent (or security message if email doesn't exist)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OTPResponse'
 *             examples:
 *               otp_sent:
 *                 summary: OTP sent successfully
 *                 value:
 *                   success: true
 *                   message: "Password reset OTP sent to your email"
 *                   data:
 *                     expiresIn: "5 minutes"
 *               security_message:
 *                 summary: Security message (email not found)
 *                 value:
 *                   success: true
 *                   message: "If an account with this email exists, you will receive an OTP shortly"
 *                   data: {}
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Failed to send email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to send password reset email. Please try again later"
 *               data: {}
 *
 * /api/v1/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password using OTP
 *     description: |
 *       Resets user password using the OTP received via email.
 *       - OTP must be valid and not expired (5 minutes)
 *       - OTP can only be used once
 *       - New password must meet strength requirements
 *       - Marks OTP as used after successful reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *           example:
 *             email: "john@example.com"
 *             otp: "123456"
 *             newPassword: "NewSecurePass123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Password reset successfully"
 *               data: {}
 *       400:
 *         description: Validation failed or invalid/expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   data:
 *                     - type: "field"
 *                       msg: "OTP must be exactly 6 digits"
 *                       path: "otp"
 *                       location: "body"
 *               invalid_otp:
 *                 summary: Invalid or expired OTP
 *                 value:
 *                   success: false
 *                   message: "Invalid or expired OTP"
 *                   data: {}
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "User not found"
 *               data: {}
 *
 * /api/v1/auth/send-verification-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Send email verification OTP
 *     description: |
 *       Sends a 6-digit OTP to verify user's email address.
 *       - OTP expires in 5 minutes
 *       - Only works for unverified email addresses
 *       - Deactivates any existing email verification OTPs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *           example:
 *             email: "john@example.com"
 *     responses:
 *       200:
 *         description: Email verification OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OTPResponse'
 *             example:
 *               success: true
 *               message: "Email verification OTP sent"
 *               data:
 *                 expiresIn: "5 minutes"
 *       400:
 *         description: Email already verified or validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               already_verified:
 *                 summary: Email already verified
 *                 value:
 *                   success: false
 *                   message: "Email is already verified"
 *                   data: {}
 *               validation_error:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   data:
 *                     - type: "field"
 *                       msg: "Please provide a valid email address"
 *                       path: "email"
 *                       location: "body"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "User not found"
 *               data: {}
 *       500:
 *         description: Failed to send email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to send email verification OTP. Please try again later"
 *               data: {}
 *
 * /api/v1/auth/verify-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify email using OTP
 *     description: |
 *       Verifies user's email address using the OTP received via email.
 *       - OTP must be valid and not expired (5 minutes)
 *       - OTP can only be used once
 *       - Updates user's email verification status
 *       - Marks OTP as used after successful verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmailRequest'
 *           example:
 *             email: "john@example.com"
 *             otp: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Email verified successfully"
 *               data: {}
 *       400:
 *         description: Validation failed, invalid OTP, or email already verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   data:
 *                     - type: "field"
 *                       msg: "OTP must contain only numbers"
 *                       path: "otp"
 *                       location: "body"
 *               invalid_otp:
 *                 summary: Invalid or expired OTP
 *                 value:
 *                   success: false
 *                   message: "Invalid or expired OTP"
 *                   data: {}
 *               already_verified:
 *                 summary: Email already verified
 *                 value:
 *                   success: false
 *                   message: "Email is already verified"
 *                   data: {}
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "User not found"
 *               data: {}
 */
