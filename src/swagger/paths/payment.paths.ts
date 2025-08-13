/**
 * @swagger
 * /api/v1/deposit/balance:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Create a deposit request
 *     description: |
 *       Creates a new deposit request and generates payment addresses for various methods.
 *
 *       **Key Features:**
 *       - Supports multiple payment methods: Lightning Network, Bitcoin on-chain, Ethereum, and Tron
 *       - Flexible currency conversion (USD to SATS, USDT, or USDC)
 *       - Returns payment addresses/invoices for all requested methods
 *       - Creates a deposit record for tracking payment status
 *       - Rate limited to prevent abuse (1000 requests per hour per user)
 *
 *       **Payment Methods:**
 *       - `lightning`: Lightning Network payment request (fastest, lowest fees)
 *       - `on_chain`: Bitcoin on-chain address (slower, higher fees, more secure)
 *       - `ethereum`: Ethereum address for USDT/USDC deposits
 *       - `tron`: Tron address for USDT deposits (lower fees)
 *
 *       **Note:** Tron payments are disabled in non-production environments.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepositRequest'
 *           examples:
 *             lightning_only:
 *               summary: Lightning Network deposit only
 *               value:
 *                 amount: 10.50
 *                 targetCurrency: "SATS"
 *                 paymentMethods: ["lightning"]
 *             multiple_methods:
 *               summary: Multiple payment methods
 *               value:
 *                 amount: 50.00
 *                 currency: "usd"
 *                 targetCurrency: "SATS"
 *                 paymentMethods: ["lightning", "on_chain", "ethereum"]
 *             usdt_deposit:
 *               summary: USDT deposit via Ethereum
 *               value:
 *                 amount: 100.00
 *                 targetCurrency: "USDT"
 *                 paymentMethods: ["ethereum", "tron"]
 *     responses:
 *       201:
 *         description: Deposit request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepositResponse'
 *             examples:
 *               lightning_deposit:
 *                 summary: Lightning Network deposit response
 *                 value:
 *                   success: true
 *                   message: "Invoice generated successfully."
 *                   data:
 *                     lightning:
 *                       payment_request: "lnbc105000n1p3xq7k2pp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq5xysxxatsyp3k7enxv4jsxqzpusp5zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygs9q2gqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9qy9qsq"
 *                     depositAddressId: "64f5b8e7d4c2a1b2c3d4e5f7"
 *                     currency: "USD"
 *                     amount: 10.50
 *                     sourceId: "speed_deposit_123456"
 *                     targetCurrency: "SATS"
 *                     targetAmount: 0.00025000
 *               multi_method_deposit:
 *                 summary: Multiple payment methods response
 *                 value:
 *                   success: true
 *                   message: "Invoice generated successfully."
 *                   data:
 *                     lightning:
 *                       payment_request: "lnbc500000n1p3..."
 *                     onchain:
 *                       address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
 *                     ethereum:
 *                       address: "0x742d35Cc6634C0532925a3b8D6Ac6f6a2fD5..."
 *                     depositAddressId: "64f5b8e7d4c2a1b2c3d4e5f8"
 *                     currency: "USD"
 *                     amount: 50.00
 *                     sourceId: "speed_deposit_123457"
 *                     targetCurrency: "SATS"
 *                     targetAmount: 0.00125000
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentError'
 *             examples:
 *               invalid_amount:
 *                 summary: Invalid amount error
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   data:
 *                     - type: "field"
 *                       msg: "Amount must be a number or float between $1 and $1000"
 *                       path: "amount"
 *                       location: "body"
 *               invalid_payment_method:
 *                 summary: Invalid payment method error
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   data:
 *                     - type: "field"
 *                       msg: "Invalid payment method. Allowed values: lightning, on_chain, ethereum, tron"
 *                       path: "paymentMethods"
 *                       location: "body"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Access denied. No token provided."
 *               data: []
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Too many requests from this IP, please try again later."
 *               data: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentError'
 *             example:
 *               success: false
 *               message: "Something went wrong, please contact our support team"
 *               data: []
 *
 * /api/v1/withdraw/balance:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Create a withdrawal request
 *     description: |
 *       Creates a new withdrawal request to send funds to an external address.
 *
 *       **Key Features:**
 *       - Supports Lightning Network withdrawals (fastest, lowest fees)
 *       - Validates sufficient balance before processing
 *       - Enforces 5-minute cooldown between withdrawals for security
 *       - Flexible currency conversion (USD to SATS, USDT, or USDC)
 *       - Real-time balance updates after successful withdrawal
 *       - Transaction tracking with unique withdrawal ID
 *
 *       **Security Features:**
 *       - Rate limiting: 1000 requests per hour per user
 *       - Withdrawal cooldown: 5 minutes between successful withdrawals
 *       - Balance validation: Cannot withdraw more than available funds
 *       - Database transactions: Ensures data consistency
 *
 *       **Supported Target Addresses:**
 *       - Lightning Network invoices (lnbc...)
 *       - Bitcoin addresses (future support)
 *       - Ethereum addresses (future support)
 *       - Tron addresses (future support)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WithdrawRequest'
 *           examples:
 *             lightning_withdrawal:
 *               summary: Lightning Network withdrawal
 *               value:
 *                 amount: 25.00
 *                 currency: "usd"
 *                 targetCurrency: "SATS"
 *                 targetAddress: "lnbc250000n1p3xq7k2pp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq5xysxxatsyp3k7enxv4jsxqzpu..."
 *             usdt_withdrawal:
 *               summary: USDT withdrawal
 *               value:
 *                 amount: 100.00
 *                 targetCurrency: "USDT"
 *                 targetAddress: "lnbc1000000n1p3..."
 *             minimal_withdrawal:
 *               summary: Minimal withdrawal (defaults)
 *               value:
 *                 amount: 5.00
 *                 targetAddress: "lnbc50000n1p3..."
 *     responses:
 *       200:
 *         description: Withdrawal request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WithdrawResponse'
 *             examples:
 *               successful_withdrawal:
 *                 summary: Successful withdrawal response
 *                 value:
 *                   success: true
 *                   message: "Withdrawal request created successfully."
 *                   data:
 *                     withdrawId: "64f5b8e7d4c2a1b2c3d4e5f8"
 *                     amount: 25.00
 *                     targetAmount: 62500
 *                     currency: "USD"
 *                     targetCurrency: "SATS"
 *                     balance: 475.50
 *       400:
 *         description: Invalid request or insufficient funds
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentError'
 *             examples:
 *               insufficient_balance:
 *                 summary: Insufficient balance error
 *                 value:
 *                   success: false
 *                   message: "Insufficient balance: You cannot withdraw more than your available funds."
 *                   data: []
 *               withdrawal_cooldown:
 *                 summary: Withdrawal cooldown error
 *                 value:
 *                   success: false
 *                   message: "You can withdraw after 5 minutes of your last withdrawal. Please try again after 3 minute(s)."
 *                   data: []
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   data:
 *                     - type: "field"
 *                       msg: "Target address is required"
 *                       path: "targetAddress"
 *                       location: "body"
 *                     - type: "field"
 *                       msg: "Withdrawal amount must be between $1 and $1000."
 *                       path: "amount"
 *                       location: "body"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Access denied. No token provided."
 *               data: []
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Too many requests from this IP, please try again later."
 *               data: []
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentError'
 *             examples:
 *               payment_provider_error:
 *                 summary: Payment provider error
 *                 value:
 *                   success: false
 *                   message: "Something went wrong, please contact our support team"
 *                   data: []
 *               internal_error:
 *                 summary: Internal processing error
 *                 value:
 *                   success: false
 *                   message: "Error while creating withdrawal request"
 *                   data: []
 */
