import express from 'express';
import { body, param } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
} from '../controllers/doctorController.js';

const router = express.Router();

// Validation rules
const doctorValidation = [
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
  body('specialization')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters'),
  body('license_number')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('License number must be between 5 and 50 characters'),
  body('years_of_experience')
    .optional()
    .isInt({ min: 0, max: 70 })
    .withMessage('Years of experience must be between 0 and 70')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid doctor ID')
];

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Routes
router.post('/', doctorValidation, createDoctor);
router.get('/', getDoctors);
router.get('/:id', idValidation, getDoctorById);
router.put('/:id', [...idValidation, ...doctorValidation], updateDoctor);
router.delete('/:id', idValidation, deleteDoctor);

export default router;