import { body } from 'express-validator';

export const ValidateDepositApi = [
  body('currency').optional().isString().withMessage('Currency must be a string'),

  body('targetCurrency').optional().isString().withMessage('Target currency must be a string'),

  body('amount')
    .isFloat({ min: 1, max: 1000 }) // Minimum 5 and maximum 10,000
    .withMessage('Amount must be a number or float between $1 and $1000')
    .matches(/^(\d{1,8}(\.\d{0,2})?)$/) // Allows a maximum of 8 digits before the decimal and up to 2 digits after the decimal
    .withMessage('Value must be a number with up to 2 decimal places'),
];

export const ValidateWithdrawApi = [
  body('currency').optional().isString().withMessage('Currency must be a string'),

  body('targetCurrency').optional().isString().withMessage('Target currency must be a string'),

  body('amount')
    .isFloat({ min: 1, max: 1000 })
    .withMessage('Withdrawal amount must be between $1 and $1000.')
    .matches(/^(\d{1,8}(\.\d{0,2})?)$/) // Allows a maximum of 8 digits before the decimal and up to 2 digits after the decimal
    .withMessage('Value must be a number with up to 2 decimal places'),
];
