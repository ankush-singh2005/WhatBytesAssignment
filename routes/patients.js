import express from 'express';
import { body, param } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
} from '../controllers/patientController.js';

const router = express.Router();

// Validation rules
const patientValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date in YYYY-MM-DD format'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('medical_history')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Medical history must not exceed 2000 characters')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid patient ID')
];

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Routes
router.post('/', patientValidation, createPatient);
router.get('/', getPatients);
router.get('/:id', idValidation, getPatientById);
router.put('/:id', [...idValidation, ...patientValidation], updatePatient);
router.delete('/:id', idValidation, deletePatient);

export default router;