/**
 * @swagger
 * components:
 *   schemas:
 *     DepositRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 1
 *           maximum: 1000
 *           example: 10.50
 *           description: Amount to deposit in USD
 *         currency:
 *           type: string
 *           example: "usd"
 *           description: Source currency (optional, defaults to USD)
 *         targetCurrency:
 *           type: string
 *           enum: ["SATS", "USDT", "USDC"]
 *           example: "SATS"
 *           description: Target currency for the deposit (optional, defaults to SATS)
 *         paymentMethods:
 *           type: array
 *           items:
 *             type: string
 *             enum: ["lightning", "on_chain", "ethereum", "tron"]
 *           example: ["lightning", "on_chain"]
 *           description: Preferred payment methods (optional, defaults to lightning)
 *
 *     DepositResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Invoice generated successfully."
 *         data:
 *           type: object
 *           properties:
 *             lightning:
 *               type: object
 *               properties:
 *                 payment_request:
 *                   type: string
 *                   example: "lnbc105000n1p3..."
 *                   description: Lightning Network payment request
 *             onchain:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   example: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
 *                   description: Bitcoin on-chain address
 *             ethereum:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   example: "0x742d35Cc6634C0532925a3b8D6Ac6f6a2fD5..."
 *                   description: Ethereum address
 *             tron:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   example: "TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7"
 *                   description: Tron address
 *             depositAddressId:
 *               type: string
 *               example: "64f5b8e7d4c2a1b2c3d4e5f7"
 *               description: Unique identifier for this deposit request
 *             currency:
 *               type: string
 *               example: "USD"
 *               description: Source currency
 *             amount:
 *               type: number
 *               example: 10.50
 *               description: Source amount
 *             sourceId:
 *               type: string
 *               example: "speed_deposit_123456"
 *               description: External provider's transaction ID
 *             targetCurrency:
 *               type: string
 *               example: "SATS"
 *               description: Target currency
 *             targetAmount:
 *               type: number
 *               example: 0.00025000
 *               description: Amount in target currency
 *
 *     WithdrawRequest:
 *       type: object
 *       required:
 *         - amount
 *         - targetAddress
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 1
 *           maximum: 1000
 *           example: 25.00
 *           description: Amount to withdraw in the specified currency
 *         currency:
 *           type: string
 *           example: "usd"
 *           description: Source currency (optional, defaults to USD)
 *         targetCurrency:
 *           type: string
 *           enum: ["SATS", "USDT", "USDC"]
 *           example: "SATS"
 *           description: Target currency for the withdrawal (optional, defaults to SATS)
 *         targetAddress:
 *           type: string
 *           example: "lnbc250000n1p3xq7k2pp5..."
 *           minLength: 10
 *           maxLength: 200
 *           description: Lightning Network invoice or wallet address for withdrawal
 *
 *     WithdrawResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Withdrawal request created successfully."
 *         data:
 *           type: object
 *           properties:
 *             withdrawId:
 *               type: string
 *               example: "64f5b8e7d4c2a1b2c3d4e5f8"
 *               description: Unique identifier for this withdrawal request
 *             amount:
 *               type: number
 *               example: 25.00
 *               description: Source amount withdrawn
 *             targetAmount:
 *               type: number
 *               example: 62500
 *               description: Amount in target currency (e.g., SATS)
 *             currency:
 *               type: string
 *               example: "USD"
 *               description: Source currency
 *             targetCurrency:
 *               type: string
 *               example: "SATS"
 *               description: Target currency
 *             balance:
 *               type: number
 *               example: 475.50
 *               description: Remaining withdrawable balance after this withdrawal
 *
 *     PaymentError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Insufficient balance: You cannot withdraw more than your available funds."
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ValidationError'
 *           description: Validation errors or additional error details
 */
