import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Heart, User, Stethoscope } from 'lucide-react';

const SPECIALTIES = [
  'Cardiology','Dermatology','Orthopedics','Neurology','Pediatrics',
  'Gynecology','Ophthalmology','ENT','Psychiatry','General Physician',
  'Oncology','Endocrinology','Gastroenterology','Urology','Pulmonology',
];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [patientForm, setPatientForm] = useState({ name: '', contact: '', dob: '', email: '', password: '' });
  const [doctorForm, setDoctorForm] = useState({ name: '', specialty: 'Cardiology', mode: 'ONLINE', fee: '', email: '', password: '' });

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register/patient', patientForm);
      login(data);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register/doctor', { ...doctorForm, fee: parseFloat(doctorForm.fee) });
      login(data);
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">MediCare</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join MediCare today — it's free</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Role Toggle */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${role === 'patient' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              <User className="w-4 h-4" /> Register as Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${role === 'doctor' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              <Stethoscope className="w-4 h-4" /> Register as Doctor
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">{error}</div>
          )}

          {role === 'patient' ? (
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input className={inputCls} required placeholder="Jan Smith" value={patientForm.name}
                    onChange={(e) => setPatientForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Contact Number</label>
                  <input className={inputCls} required placeholder="+1 555 0100" value={patientForm.contact}
                    onChange={(e) => setPatientForm((f) => ({ ...f, contact: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="date" className={inputCls} required value={patientForm.dob}
                    onChange={(e) => setPatientForm((f) => ({ ...f, dob: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" className={inputCls} required placeholder="you@email.com" value={patientForm.email}
                    onChange={(e) => setPatientForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input type="password" className={inputCls} required placeholder="Min 8 characters" value={patientForm.password}
                  onChange={(e) => setPatientForm((f) => ({ ...f, password: e.target.value }))} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition disabled:opacity-60 mt-2">
                {loading ? 'Creating account...' : 'Create Patient Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input className={inputCls} required placeholder="Dr. Alex Johnson" value={doctorForm.name}
                    onChange={(e) => setDoctorForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Specialty</label>
                  <select className={inputCls} value={doctorForm.specialty}
                    onChange={(e) => setDoctorForm((f) => ({ ...f, specialty: e.target.value }))}>
                    {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Consultation Mode</label>
                  <div className="flex gap-2 mt-1">
                    {['ONLINE', 'OFFLINE'].map((m) => (
                      <label key={m} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${doctorForm.mode === m ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
                        <input type="radio" name="mode" value={m} checked={doctorForm.mode === m}
                          onChange={(e) => setDoctorForm((f) => ({ ...f, mode: e.target.value }))} className="sr-only" />
                        {m === 'ONLINE' ? '🎥' : '🏥'} {m}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Consultation Fee ($)</label>
                  <input type="number" min="1" step="0.01" className={inputCls} required placeholder="150.00" value={doctorForm.fee}
                    onChange={(e) => setDoctorForm((f) => ({ ...f, fee: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" className={inputCls} required placeholder="doctor@hospital.com" value={doctorForm.email}
                  onChange={(e) => setDoctorForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input type="password" className={inputCls} required placeholder="Min 8 characters" value={doctorForm.password}
                  onChange={(e) => setDoctorForm((f) => ({ ...f, password: e.target.value }))} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition disabled:opacity-60 mt-2">
                {loading ? 'Creating account...' : 'Create Doctor Account'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
