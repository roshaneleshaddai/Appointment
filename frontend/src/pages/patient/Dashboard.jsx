import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Calendar, Clock, Video, MapPin, TrendingUp, Plus } from 'lucide-react';

const statusColor = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/appointments/patient/${user.id}`)
      .then(({ data }) => setAppointments(data.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const upcoming = appointments.filter((a) => a.status === 'SCHEDULED');
  const recent = appointments.filter((a) => a.status !== 'SCHEDULED').slice(0, 4);
  const nextAppt = upcoming[0];

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-0.5">Welcome back, {user.name}</p>
        </div>
        <Link
          to="/patient/book"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Book Appointment
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{upcoming.length}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
          {nextAppt && (
            <p className="text-xs text-blue-600 font-medium mt-1">Next: {nextAppt.date} · {nextAppt.timeSlot}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{appointments.filter((a) => a.status === 'COMPLETED').length}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Completed Visits</p>
          <p className="text-xs text-gray-400 mt-1">Total consultations done</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{appointments.length}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Total Appointments</p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>
      </div>

      {/* Two columns: Upcoming + Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link to="/patient/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : upcoming.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No upcoming appointments</p>
              <Link to="/patient/book" className="text-sm text-blue-600 font-medium hover:underline mt-2 inline-block">Book one now</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcoming.slice(0, 4).map((a) => (
                <div key={a.id} className="p-4 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${a.mode === 'ONLINE' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                    {a.mode === 'ONLINE' ? <Video className="w-4 h-4 text-blue-600" /> : <MapPin className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{a.doctorName}</p>
                    <p className="text-xs text-gray-500">{a.specialty}</p>
                    <p className="text-xs text-gray-400 mt-1">{a.date} · {a.timeSlot}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[a.status]}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
            <Link to="/patient/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : recent.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">No past appointments yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.map((a) => (
                <div key={a.id} className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gray-500">{a.doctorName?.[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{a.doctorName}</p>
                    <p className="text-xs text-gray-500">{a.specialty}</p>
                    <p className="text-xs text-gray-400 mt-1">{a.date} · ${a.fee}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[a.status]}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/patient/book?mode=ONLINE"
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            <Video className="w-4 h-4" /> Book Online Consultation
          </Link>
          <Link to="/patient/book?mode=OFFLINE"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition">
            <MapPin className="w-4 h-4" /> Book Clinic Visit
          </Link>
          <Link to="/patient/appointments"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition">
            <Calendar className="w-4 h-4" /> View All Appointments
          </Link>
        </div>
      </div>
    </div>
  );
}
