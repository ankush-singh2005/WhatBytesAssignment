import { validationResult } from 'express-validator';
import { promisify } from 'util';
import { db } from '../config/database.js';

const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

export const createPatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, phone, date_of_birth, gender, address, medical_history } = req.body;
    const created_by = req.user.id;

    const result = await dbRun(
      `INSERT INTO patients (name, email, phone, date_of_birth, gender, address, medical_history, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, date_of_birth, gender, address, medical_history, created_by]
    );

    const patient = await dbGet('SELECT * FROM patients WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Patient created successfully',
      patient: {
        ...patient,
        password: undefined
      }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({
      error: 'Failed to create patient',
      message: 'Internal server error'
    });
  }
};

export const getPatients = async (req, res) => {
  try {
    const created_by = req.user.id;
    const patients = await dbAll('SELECT * FROM patients WHERE created_by = ?', [created_by]);

    res.json({
      message: 'Patients retrieved successfully',
      patients,
      count: patients.length
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      error: 'Failed to retrieve patients',
      message: 'Internal server error'
    });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const created_by = req.user.id;

    const patient = await dbGet(
      'SELECT * FROM patients WHERE id = ? AND created_by = ?',
      [id, created_by]
    );

    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found',
        message: 'Patient does not exist or you do not have permission to view it'
      });
    }

    res.json({
      message: 'Patient retrieved successfully',
      patient
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      error: 'Failed to retrieve patient',
      message: 'Internal server error'
    });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { name, email, phone, date_of_birth, gender, address, medical_history } = req.body;
    const created_by = req.user.id;

    // Check if patient exists and belongs to user
    const existingPatient = await dbGet(
      'SELECT * FROM patients WHERE id = ? AND created_by = ?',
      [id, created_by]
    );

    if (!existingPatient) {
      return res.status(404).json({
        error: 'Patient not found',
        message: 'Patient does not exist or you do not have permission to update it'
      });
    }

    await dbRun(
      `UPDATE patients SET 
       name = ?, email = ?, phone = ?, date_of_birth = ?, 
       gender = ?, address = ?, medical_history = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND created_by = ?`,
      [name, email, phone, date_of_birth, gender, address, medical_history, id, created_by]
    );

    const updatedPatient = await dbGet('SELECT * FROM patients WHERE id = ?', [id]);

    res.json({
      message: 'Patient updated successfully',
      patient: updatedPatient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      error: 'Failed to update patient',
      message: 'Internal server error'
    });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const created_by = req.user.id;

    // Check if patient exists and belongs to user
    const existingPatient = await dbGet(
      'SELECT * FROM patients WHERE id = ? AND created_by = ?',
      [id, created_by]
    );

    if (!existingPatient) {
      return res.status(404).json({
        error: 'Patient not found',
        message: 'Patient does not exist or you do not have permission to delete it'
      });
    }

    await dbRun('DELETE FROM patients WHERE id = ? AND created_by = ?', [id, created_by]);

    res.json({
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      error: 'Failed to delete patient',
      message: 'Internal server error'
    });
  }
};