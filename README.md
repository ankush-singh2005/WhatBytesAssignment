# Healthcare Backend API

A comprehensive healthcare management backend built with Node.js, Express, JWT authentication, and SQLite.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Patient Management**: Full CRUD operations for patient records
- **Doctor Management**: Complete doctor profile management
- **Patient-Doctor Mapping**: Assign and manage doctor-patient relationships
- **Security**: JWT-based authentication with password hashing
- **Validation**: Comprehensive input validation and error handling

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Patients (Authentication Required)
- `POST /api/patients` - Create a new patient
- `GET /api/patients` - Get all patients for authenticated user
- `GET /api/patients/:id` - Get specific patient details
- `PUT /api/patients/:id` - Update patient information
- `DELETE /api/patients/:id` - Delete patient record

### Doctors (Authentication Required)
- `POST /api/doctors` - Create a new doctor
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get specific doctor details
- `PUT /api/doctors/:id` - Update doctor information
- `DELETE /api/doctors/:id` - Delete doctor record

### Patient-Doctor Mappings (Authentication Required)
- `POST /api/mappings` - Assign doctor to patient
- `GET /api/mappings` - Get all mappings for authenticated user
- `GET /api/mappings/:patient_id` - Get all doctors for specific patient
- `DELETE /api/mappings/:id` - Remove doctor assignment

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The API will be available at `http://localhost:3000`

## Authentication

For protected endpoints, include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Example Usage

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Create a Patient
```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "date_of_birth": "1990-05-15",
    "gender": "female",
    "address": "123 Main St, City, State",
    "medical_history": "No known allergies"
  }'
```

## Database Schema

The application uses SQLite with the following tables:
- **users**: User accounts with authentication
- **patients**: Patient records linked to users
- **doctors**: Doctor profiles with specializations
- **patient_doctor_mappings**: Relationships between patients and doctors

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention
- CORS protection
- Error handling without sensitive data exposure