# Smart Clinic Appointment System

A full-stack production-ready web application for managing clinic appointments with real-time queue tracking.

## 🏥 Features

### For Doctors
- ✅ Register & Login with secure authentication
- ✅ Create and manage professional profile
- ✅ Set availability and time slots
- ✅ View today's appointments
- ✅ Manage appointment status (Pending → Confirmed → Completed)
- ✅ Access patient history
- ✅ Real-time queue monitoring

### For Patients
- ✅ Register & Login with secure authentication
- ✅ Browse available doctors by specialization
- ✅ View doctor profiles and availability
- ✅ Book appointments online
- ✅ Cancel appointments
- ✅ View appointment history
- ✅ Real-time queue tracking

### Real-time Features
- 🔴 Live queue updates via Socket.io
- 🔴 Instant appointment status notifications
- 🔴 Real-time queue position tracking
- 🔴 Estimated wait time calculations

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js (Vite)** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Socket.io Client** - Real-time updates
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Doctor_WebApp
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
```

#### Environment Variables (.env)

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-clinic?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Seed Database (Optional)

```bash
# Run seed script to populate with sample data
npm run seed
```

This will create:
- 3 sample doctors
- 3 sample patients
- Demo login credentials

#### Start Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
touch .env
```

#### Environment Variables (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### Start Frontend Server

```bash
npm run dev
```

## 📱 Application Usage

### Demo Credentials

#### Doctor Accounts
- **Dr. Sarah Johnson**: sarah.johnson@clinic.com / doctor123
- **Dr. Michael Chen**: michael.chen@clinic.com / doctor123  
- **Dr. Emily Rodriguez**: emily.rodriguez@clinic.com / doctor123

#### Patient Accounts
- **John Smith**: john.smith@email.com / patient123
- **Mary Williams**: mary.williams@email.com / patient123
- **David Brown**: david.brown@email.com / patient123

### Workflow

1. **Registration/Login**: Users register as doctor or patient
2. **Doctor Setup**: Doctors complete profile and set availability
3. **Browse & Book**: Patients browse doctors and book appointments
4. **Queue Management**: Real-time queue updates for all users
5. **Appointment Management**: Doctors manage appointment status

## 🏗 Project Structure

```
Doctor_WebApp/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── doctorController.js   # Doctor operations
│   │   └── appointmentController.js # Appointment logic
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT authentication
│   │   ├── roleMiddleware.js     # Role-based access
│   │   └── errorMiddleware.js    # Error handling
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── DoctorProfile.js      # Doctor profile schema
│   │   └── Appointment.js        # Appointment schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── doctorRoutes.js       # Doctor endpoints
│   │   └── appointmentRoutes.js   # Appointment endpoints
│   ├── utils/
│   │   ├── generateToken.js      # JWT utility
│   │   └── seedData.js           # Database seeder
│   ├── server.js                 # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   ├── Sidebar.jsx       # Sidebar navigation
│   │   │   ├── DoctorCard.jsx    # Doctor display card
│   │   │   ├── AppointmentCard.jsx # Appointment card
│   │   │   └── QueueStatus.jsx   # Queue display component
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Register.jsx      # Registration page
│   │   │   ├── DoctorDashboard.jsx # Doctor dashboard
│   │   │   ├── PatientDashboard.jsx # Patient dashboard
│   │   │   ├── BookAppointment.jsx # Booking page
│   │   │   └── QueuePage.jsx     # Queue monitoring
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── services/
│   │   │   ├── api.js            # API service
│   │   │   └── socket.js         # Socket service
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # App entry point
│   │   └── index.css             # Global styles
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/profile` - Update doctor profile
- `PUT /api/doctors/availability` - Update availability
- `GET /api/doctors/appointments/today` - Get today's appointments
- `GET /api/doctors/patient-history` - Get patient history

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get appointments
- `PUT /api/appointments/:id/status` - Update appointment status
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/queue/:doctorId/:date` - Get queue

## 🔌 Socket.io Events

### Client → Server
- `joinDoctorRoom` - Join doctor's room for updates
- `joinPatientRoom` - Join patient's room for updates

### Server → Client
- `appointmentBooked` - New appointment created
- `queueUpdated` - Queue status updated
- `statusUpdated` - Appointment status changed

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional medical interface
- **Real-time Updates**: Live queue and status updates
- **Intuitive Navigation**: Easy-to-use sidebar and routing
- **Status Indicators**: Color-coded appointment statuses
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Non-intrusive feedback

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **Role-based Access**: Doctor/patient role separation
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Cross-origin request security
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

### Backend (Render)
1. Connect GitHub repository to Render
2. Set environment variables
3. Deploy Node.js service
4. Configure MongoDB Atlas connection

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy React app
4. Configure API endpoints

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Configure network access
3. Create database user
4. Get connection string

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review demo credentials

## 🔄 Future Enhancements

- [ ] Email notifications for appointments
- [ ] SMS reminders
- [ ] Video consultation integration
- [ ] Payment processing
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Calendar integration
- [ ] Prescription management
- [ ] Medical records system
