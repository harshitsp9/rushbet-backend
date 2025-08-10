/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile
 *     description: |
 *       Retrieves the authenticated user's profile information.
 *       This endpoint requires JWT authentication via Bearer token.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Profile retrieved successfully"
 *               data:
 *                 user:
 *                   id: "64f5b8e7d4c2a1b2c3d4e5f7"
 *                   username: "john_doe"
 *                   email: "john@example.com"
 *                   country: "USA"
 *                   authProvider: "email"
 *                   isEmailVerified: true
 *                   status: "active"
 *                   lastLogin: "2024-01-15T11:30:00.000Z"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   updatedAt: "2024-01-15T12:00:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_token:
 *                 summary: Missing authorization token
 *                 value:
 *                   success: false
 *                   message: "Authentication required"
 *                   data: {}
 *               invalid_token:
 *                 summary: Invalid or expired token
 *                 value:
 *                   success: false
 *                   message: "Invalid or expired token"
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
