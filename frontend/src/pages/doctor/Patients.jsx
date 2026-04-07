import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Users, Search, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function DoctorPatients() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get(`/api/appointments/doctor/${user.id}`);
        // Ensure recent ones are on top
        const sorted = (data.appointments || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        setAppointments(sorted);
      } catch (err) {
        console.error('Failed to fetch patients', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchPatients();
  }, [user.id]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Group by patient name or just list all historical appointments? 
  // User asked for "patient history" sorted by recent top.
  // We'll just display the full timeline of appointments since that is the history.
  
  const filtered = appointments.filter(a => 
    a.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients History</h1>
          <p className="text-gray-500 mt-0.5">View your past and upcoming patient appointments</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 rounded-tr-lg"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                       <Clock className="w-5 h-5 animate-spin"/> Loading patients...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                    No patient history found.
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{appt.patientName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{new Date(appt.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{appt.timeSlot}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {appt.patientContact || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(appt.status)}`}>
                        {getStatusIcon(appt.status)}
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="View Health Report">
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
