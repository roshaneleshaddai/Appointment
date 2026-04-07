import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Users, Calendar, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

const statusStyle = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get(`/api/appointments/doctor/${user.id}`, { params });
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [user.id, dateFilter, statusFilter]);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await api.patch(`/api/appointments/${id}/status`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const inputCls = 'px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Manager</h1>
          <p className="text-gray-500 mt-0.5">View and manage all your patient appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Date</label>
          <input type="date" value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls}>
            <option value="">All</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        {(dateFilter || statusFilter) && (
          <div className="flex items-end">
            <button onClick={() => { setDateFilter(''); setStatusFilter(''); }}
              className="text-sm text-blue-600 hover:underline font-medium px-3 py-2">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{appointments.filter((a) => a.status === 'SCHEDULED').length}</p>
          <p className="text-xs text-blue-600 mt-0.5">Scheduled</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{appointments.filter((a) => a.status === 'COMPLETED').length}</p>
          <p className="text-xs text-green-600 mt-0.5">Completed</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{appointments.filter((a) => a.status === 'CANCELLED').length}</p>
          <p className="text-xs text-red-600 mt-0.5">Cancelled</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No appointments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left py-3 px-5 font-medium">Patient</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Time Slot</th>
                <th className="text-left py-3 px-4 font-medium">Mode</th>
                <th className="text-left py-3 px-4 font-medium">Fee</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
                        {a.patientName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{a.patientName}</p>
                        <p className="text-xs text-gray-400">{a.patientContact}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{a.date}</td>
                  <td className="py-3 px-4 text-gray-600">{a.timeSlot}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.mode === 'ONLINE' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                      {a.mode}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-700">${a.fee}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {a.status === 'SCHEDULED' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => updateStatus(a.id, 'COMPLETED')}
                          disabled={updating === a.id}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition disabled:opacity-50"
                        >
                          {updating === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Complete
                        </button>
                        <button
                          onClick={() => updateStatus(a.id, 'CANCELLED')}
                          disabled={updating === a.id}
                          className="flex items-center gap-1 border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium hover:text-red-500 hover:border-red-300 transition disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    )}
                    {a.status !== 'SCHEDULED' && (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
