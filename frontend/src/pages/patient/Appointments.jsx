import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Video, MapPin, Calendar, Search, Filter, ExternalLink } from 'lucide-react';

const STATUS_TABS = ['All', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];

const statusStyle = {
  SCHEDULED: { badge: 'bg-blue-100 text-blue-700', row: '' },
  COMPLETED: { badge: 'bg-green-100 text-green-700', row: 'opacity-75' },
  CANCELLED: { badge: 'bg-red-100 text-red-700', row: 'opacity-50' },
};

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get(`/api/appointments/patient/${user.id}`)
      .then(({ data }) => setAppointments(data.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.patch(`/api/appointments/${id}/status`, { status: 'CANCELLED' });
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'CANCELLED' } : a));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel');
    }
  };

  const filtered = appointments
    .filter((a) => activeTab === 'All' || a.status === activeTab)
    .filter((a) => a.doctorName?.toLowerCase().includes(search.toLowerCase()) || a.specialty?.toLowerCase().includes(search.toLowerCase()));

  const counts = { All: appointments.length, SCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 };
  appointments.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1; });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 mt-0.5">Manage and view your appointments</p>
        </div>
        <Link to="/patient/book"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          + Book Appointment
        </Link>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {STATUS_TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>{counts[tab] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input placeholder="Search appointments..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading appointments...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No appointments found</p>
          <Link to="/patient/book" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">Book your first appointment</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <div key={a.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${statusStyle[a.status]?.row}`}>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {a.doctorName?.[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{a.doctorName}</h3>
                      <p className="text-sm text-gray-500">{a.specialty}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${statusStyle[a.status]?.badge}`}>{a.status}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5" /> {a.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      🕐 {a.timeSlot}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      {a.mode === 'ONLINE'
                        ? <><Video className="w-3.5 h-3.5 text-blue-500" /> Online Consultation</>
                        : <><MapPin className="w-3.5 h-3.5 text-orange-500" /> In-Clinic Visit</>}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      💰 ${a.fee}
                    </div>
                  </div>

                  {/* Location/Link Banner */}
                  {a.mode === 'OFFLINE' && a.linkOrAddress && (
                    <div className="mt-3 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                      <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm text-orange-700">{a.linkOrAddress}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 items-end flex-shrink-0">
                  {a.status === 'SCHEDULED' && a.mode === 'ONLINE' && (
                    <a href={a.linkOrAddress || '#'} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                      <Video className="w-4 h-4" /> Join Video Call
                    </a>
                  )}
                  {a.status === 'SCHEDULED' && a.mode === 'OFFLINE' && (
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                      <ExternalLink className="w-4 h-4" /> Get Directions
                    </button>
                  )}
                  {a.status === 'SCHEDULED' && (
                    <button onClick={() => handleCancel(a.id)}
                      className="flex items-center gap-2 border border-gray-200 text-gray-500 px-4 py-2 rounded-xl text-sm font-medium hover:border-red-300 hover:text-red-500 transition">
                      Cancel
                    </button>
                  )}
                  {a.status === 'COMPLETED' && (
                    <Link to="/patient/book"
                      className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition">
                      Book Again
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
