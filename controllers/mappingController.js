import { validationResult } from 'express-validator';
import { promisify } from 'util';
import { db } from '../config/database.js';

const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

export const createMapping = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { patient_id, doctor_id, notes } = req.body;
    const created_by = req.user.id;

    // Verify patient exists and belongs to user
    const patient = await dbGet(
      'SELECT * FROM patients WHERE id = ? AND created_by = ?',
      [patient_id, created_by]
    );
    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found',
        message: 'Patient does not exist or you do not have permission to assign doctors'
      });
    }

    // Verify doctor exists
    const doctor = await dbGet('SELECT * FROM doctors WHERE id = ?', [doctor_id]);
    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor not found',
        message: 'Doctor does not exist'
      });
    }

    // Check if mapping already exists
    const existingMapping = await dbGet(
      'SELECT * FROM patient_doctor_mappings WHERE patient_id = ? AND doctor_id = ?',
      [patient_id, doctor_id]
    );
    if (existingMapping) {
      return res.status(409).json({
        error: 'Mapping already exists',
        message: 'This doctor is already assigned to this patient'
      });
    }

    const result = await dbRun(
      'INSERT INTO patient_doctor_mappings (patient_id, doctor_id, notes, created_by) VALUES (?, ?, ?, ?)',
      [patient_id, doctor_id, notes, created_by]
    );

    const mapping = await dbGet(
      `SELECT pdm.*, p.name as patient_name, d.name as doctor_name, d.specialization
       FROM patient_doctor_mappings pdm
       JOIN patients p ON pdm.patient_id = p.id
       JOIN doctors d ON pdm.doctor_id = d.id
       WHERE pdm.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      message: 'Doctor assigned to patient successfully',
      mapping
    });
  } catch (error) {
    console.error('Create mapping error:', error);
    res.status(500).json({
      error: 'Failed to create mapping',
      message: 'Internal server error'
    });
  }
};

export const getMappings = async (req, res) => {
  try {
    const created_by = req.user.id;
    
    const mappings = await dbAll(
      `SELECT pdm.*, p.name as patient_name, d.name as doctor_name, d.specialization
       FROM patient_doctor_mappings pdm
       JOIN patients p ON pdm.patient_id = p.id
       JOIN doctors d ON pdm.doctor_id = d.id
       WHERE pdm.created_by = ?
       ORDER BY pdm.assigned_date DESC`,
      [created_by]
    );

    res.json({
      message: 'Mappings retrieved successfully',
      mappings,
      count: mappings.length
    });
  } catch (error) {
    console.error('Get mappings error:', error);
    res.status(500).json({
      error: 'Failed to retrieve mappings',
      message: 'Internal server error'
    });
  }
};

export const getPatientDoctors = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const created_by = req.user.id;

    // Verify patient exists and belongs to user
    const patient = await dbGet(
      'SELECT * FROM patients WHERE id = ? AND created_by = ?',
      [patient_id, created_by]
    );
    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found',
        message: 'Patient does not exist or you do not have permission to view it'
      });
    }

    const doctors = await dbAll(
      `SELECT d.*, pdm.assigned_date, pdm.notes, pdm.id as mapping_id
       FROM doctors d
       JOIN patient_doctor_mappings pdm ON d.id = pdm.doctor_id
       WHERE pdm.patient_id = ? AND pdm.created_by = ?
       ORDER BY pdm.assigned_date DESC`,
      [patient_id, created_by]
    );

    res.json({
      message: 'Patient doctors retrieved successfully',
      patient: {
        id: patient.id,
        name: patient.name
      },
      doctors,
      count: doctors.length
    });
  } catch (error) {
    console.error('Get patient doctors error:', error);
    res.status(500).json({
      error: 'Failed to retrieve patient doctors',
      message: 'Internal server error'
    });
  }
};

export const deleteMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const created_by = req.user.id;

    // Check if mapping exists and belongs to user
    const existingMapping = await dbGet(
      'SELECT * FROM patient_doctor_mappings WHERE id = ? AND created_by = ?',
      [id, created_by]
    );

    if (!existingMapping) {
      return res.status(404).json({
        error: 'Mapping not found',
        message: 'Mapping does not exist or you do not have permission to delete it'
      });
    }

    await dbRun('DELETE FROM patient_doctor_mappings WHERE id = ? AND created_by = ?', [id, created_by]);

    res.json({
      message: 'Doctor unassigned from patient successfully'
    });
  } catch (error) {
    console.error('Delete mapping error:', error);
    res.status(500).json({
      error: 'Failed to delete mapping',
      message: 'Internal server error'
    });
  }
};