import express from 'express';
import { body, param } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import {
  createMapping,
  getMappings,
  getPatientDoctors,
  deleteMapping
} from '../controllers/mappingController.js';

const router = express.Router();

// Validation rules
const mappingValidation = [
  body('patient_id')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),
  body('doctor_id')
    .isInt({ min: 1 })
    .withMessage('Valid doctor ID is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID')
];

const patientIdValidation = [
  param('patient_id')
    .isInt({ min: 1 })
    .withMessage('Invalid patient ID')
];

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Routes
router.post('/', mappingValidation, createMapping);
router.get('/', getMappings);
router.get('/:patient_id', patientIdValidation, getPatientDoctors);
router.delete('/:id', idValidation, deleteMapping);

export default router;