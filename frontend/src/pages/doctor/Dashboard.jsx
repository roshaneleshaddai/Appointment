import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Calendar, Users, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

const statusStyle = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [todayAppts, setTodayAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.get(`/api/appointments/today/doctor/${user.id}`)
      .then(({ data }) => setTodayAppts(data.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const scheduled = todayAppts.filter((a) => a.status === 'SCHEDULED').length;
  const completed = todayAppts.filter((a) => a.status === 'COMPLETED').length;
  const cancelled = todayAppts.filter((a) => a.status === 'CANCELLED').length;
  const revenue = todayAppts.filter((a) => a.status === 'COMPLETED').reduce((s, a) => s + (a.fee || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-500 mt-0.5">Welcome back, Dr. {user.name} · {today}</p>
        </div>
        <Link to="/doctor/schedule"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          + Manage Schedule
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayAppts.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Today's Appointments</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{scheduled}</p>
          <p className="text-sm text-gray-500 mt-0.5">Scheduled</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{completed}</p>
          <p className="text-sm text-gray-500 mt-0.5">Completed</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${revenue.toFixed(0)}</p>
          <p className="text-sm text-gray-500 mt-0.5">Today's Revenue</p>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Today's Appointments</h2>
          <Link to="/doctor/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : todayAppts.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No appointments scheduled for today</p>
            <Link to="/doctor/schedule" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">Add availability</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayAppts.map((a) => (
              <div key={a.id} className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                  {a.patientName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{a.patientName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.timeSlot} · {a.mode === 'ONLINE' ? '🎥 Online' : '🏥 In-Clinic'} · ${a.fee}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[a.status]}`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
