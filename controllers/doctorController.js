import { validationResult } from 'express-validator';
import { promisify } from 'util';
import { db } from '../config/database.js';

const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

export const createDoctor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, phone, specialization, license_number, years_of_experience } = req.body;
    const created_by = req.user.id;

    // Check if doctor with same license number exists
    const existingDoctor = await dbGet('SELECT id FROM doctors WHERE license_number = ?', [license_number]);
    if (existingDoctor) {
      return res.status(409).json({
        error: 'Doctor already exists',
        message: 'A doctor with this license number already exists'
      });
    }

    const result = await dbRun(
      `INSERT INTO doctors (name, email, phone, specialization, license_number, years_of_experience, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, specialization, license_number, years_of_experience || 0, created_by]
    );

    const doctor = await dbGet('SELECT * FROM doctors WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Doctor created successfully',
      doctor
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      error: 'Failed to create doctor',
      message: 'Internal server error'
    });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const doctors = await dbAll('SELECT * FROM doctors ORDER BY name');

    res.json({
      message: 'Doctors retrieved successfully',
      doctors,
      count: doctors.length
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      error: 'Failed to retrieve doctors',
      message: 'Internal server error'
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await dbGet('SELECT * FROM doctors WHERE id = ?', [id]);

    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor not found',
        message: 'Doctor does not exist'
      });
    }

    res.json({
      message: 'Doctor retrieved successfully',
      doctor
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      error: 'Failed to retrieve doctor',
      message: 'Internal server error'
    });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { name, email, phone, specialization, license_number, years_of_experience } = req.body;

    // Check if doctor exists
    const existingDoctor = await dbGet('SELECT * FROM doctors WHERE id = ?', [id]);
    if (!existingDoctor) {
      return res.status(404).json({
        error: 'Doctor not found',
        message: 'Doctor does not exist'
      });
    }

    // Check if license number is being changed and if it conflicts
    if (license_number !== existingDoctor.license_number) {
      const conflictingDoctor = await dbGet('SELECT id FROM doctors WHERE license_number = ? AND id != ?', [license_number, id]);
      if (conflictingDoctor) {
        return res.status(409).json({
          error: 'License number conflict',
          message: 'Another doctor with this license number already exists'
        });
      }
    }

    await dbRun(
      `UPDATE doctors SET 
       name = ?, email = ?, phone = ?, specialization = ?, 
       license_number = ?, years_of_experience = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, phone, specialization, license_number, years_of_experience || 0, id]
    );

    const updatedDoctor = await dbGet('SELECT * FROM doctors WHERE id = ?', [id]);

    res.json({
      message: 'Doctor updated successfully',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({
      error: 'Failed to update doctor',
      message: 'Internal server error'
    });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if doctor exists
    const existingDoctor = await dbGet('SELECT * FROM doctors WHERE id = ?', [id]);
    if (!existingDoctor) {
      return res.status(404).json({
        error: 'Doctor not found',
        message: 'Doctor does not exist'
      });
    }

    await dbRun('DELETE FROM doctors WHERE id = ?', [id]);

    res.json({
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      error: 'Failed to delete doctor',
      message: 'Internal server error'
    });
  }
};