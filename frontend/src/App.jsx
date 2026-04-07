import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/Appointments';

// Doctor pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorSchedule from './pages/doctor/Schedule';
import DoctorAppointments from './pages/doctor/Appointments';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';

function SmartRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  const map = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };
  return <Navigate to={map[user.role] || '/'} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route element={<ProtectedLayout allowedRole="patient" />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/book" element={<BookAppointment />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
          </Route>

          {/* Doctor Routes */}
          <Route element={<ProtectedLayout allowedRole="doctor" />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedLayout allowedRole="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="/dashboard" element={<SmartRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
