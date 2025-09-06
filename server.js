import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import doctorRoutes from './routes/doctors.js';
import mappingRoutes from './routes/mappings.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Healthcare Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.all('/', (req, res) => {
  res.json({
    message: 'Healthcare Backend API',
    version: '1.0.0',
    documentation: '/api',
    health: '/health'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/mappings', mappingRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Healthcare Backend API',
    version: '1.0.0',
    endpoints: {
      authentication: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user and get JWT token'
      },
      patients: {
        'POST /api/patients': 'Create a new patient (Auth required)',
        'GET /api/patients': 'Get all patients for authenticated user',
        'GET /api/patients/:id': 'Get specific patient details',
        'PUT /api/patients/:id': 'Update patient details',
        'DELETE /api/patients/:id': 'Delete patient record'
      },
      doctors: {
        'POST /api/doctors': 'Create a new doctor (Auth required)',
        'GET /api/doctors': 'Get all doctors',
        'GET /api/doctors/:id': 'Get specific doctor details',
        'PUT /api/doctors/:id': 'Update doctor details',
        'DELETE /api/doctors/:id': 'Delete doctor record'
      },
      mappings: {
        'POST /api/mappings': 'Assign doctor to patient (Auth required)',
        'GET /api/mappings': 'Get all patient-doctor mappings',
        'GET /api/mappings/:patient_id': 'Get all doctors for specific patient',
        'DELETE /api/mappings/:id': 'Remove doctor from patient'
      }
    },
    authentication: 'Include "Authorization: Bearer <token>" header for protected endpoints'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Healthcare Backend Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();